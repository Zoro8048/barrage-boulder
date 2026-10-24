/**
 * GameEngine - Central Simulation Coordinator
 */

import { PHYSICS, COMBAT } from '../config/constants.js';
import { POWERUP_META, POWERUP_DROP_CHANCE } from '../config/powerups.js';
import { TACTICAL_AUGMENTS } from '../config/augments.js';
import { ObjectPool } from './ObjectPool.js';
import { formatNum } from './utils.js';
import {
  getUpgradeCost,
  getFireRateShotsPerSec,
  getBarrelCount,
  getDroneCount,
  getBulletDamage,
  getCoinMultiplier,
} from '../state/UpgradeMath.js';
import { Cannon } from '../entities/Cannon.js';
import { WaveSystem } from '../systems/WaveSystem.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { CombatSystem } from '../systems/CombatSystem.js';

export class GameEngine {
  constructor({ bus, saveManager, achievementTracker }) {
    this.bus = bus;
    this.saveManager = saveManager;
    this.achievementTracker = achievementTracker;

    this.width = 400;
    this.height = 700;
    this.groundY = 600;

    this.gameState = 'LOBBY';
    this.gameMode = 'STANDARD'; // 'STANDARD' | 'BOSS_RUSH'
    this.score = 0;
    this.runCoins = 0;
    this.usedRevive = false;
    this.invulnerableTimer = 0;
    this.intermissionLockTimer = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;

    // Combo & Fatal Slow-Mo State
    this.comboCount = 0;
    this.comboTimer = 0;
    this.ultimateCharge = 0;
    this.ultimateBeamTimer = 0;
    this.deathSlowMoTimer = 0;

    // 3-Segment Hull Shield Integrity & Run Augments
    this.maxHull = 3;
    this.hull = 3;
    this.activeAugments = [];
    this.recalcMaxHull();

    this.activePowerups = {
      rapidFire: 0,
      spreadShot: 0,
      explosiveRounds: 0,
      piercingLaser: 0,
      giantBullets: 0,
      shield: 0,
      magnet: 0,
      freeze: 0,
    };

    this.cannon = new Cannon(200, 600);
    this.waveSystem = new WaveSystem(bus);
    this.physicsSystem = new PhysicsSystem(bus);
    this.combatSystem = new CombatSystem(bus);

    // Active entity lists
    this.bullets = [];
    this.rocks = [];
    this.coins = [];
    this.powerups = [];
    this.particles = [];
    this.shockwaves = [];
    this.laserBeams = [];
    this.floatingTexts = [];

    // Object Pools for high-frequency objects
    this.bulletPool = new ObjectPool(() => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 5.5,
      overdrive: false,
      isDrone: false,
      damageRatio: 1.0,
    }));

    this.particlePool = new ObjectPool(() => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 3,
      color: '#fff',
      life: 1,
      decay: 2,
    }));

    this.textPool = new ObjectPool(() => ({
      x: 0,
      y: 0,
      text: '',
      color: '#ffcf33',
      size: 16,
      vy: -55,
      life: 1,
    }));
  }

  setViewport(width, height) {
    this.width = width;
    this.height = height;
    const groundH =
      this.gameState === 'LOBBY'
        ? PHYSICS.LOBBY_GROUND_HEIGHT || PHYSICS.GROUND_HEIGHT
        : PHYSICS.GROUND_HEIGHT;
    this.groundY = height - groundH;
    this.cannon.setBounds(width, this.groundY);
  }

  // --- Computed Stats ---
  recalcMaxHull() {
    let max = 3;
    if (this.saveManager?.state?.upgrades?.offlineEarnings >= 10) max += 1;
    if (this.activeAugments && this.activeAugments.includes('aegisPlating')) max += 1;
    this.maxHull = max;
    this.hull = Math.min(this.hull || max, max);
    if (this.bus) {
      this.bus.emit('hull:updated', { hull: this.hull, maxHull: this.maxHull });
    }
  }

  getFireRateShotsPerSec() {
    const variety = this.saveManager.getActiveCannon();
    const base = getFireRateShotsPerSec(
      this.saveManager.state.upgrades.fireRate,
      this.activePowerups.rapidFire > 0
    );
    const augMult = this.activeAugments?.includes('hyperLoader') ? 1.25 : 1.0;
    return base * (variety.fireRateMult || 1) * augMult;
  }

  getBarrelCount() {
    return getBarrelCount(this.saveManager.state.upgrades.fireRate);
  }

  getDroneCount() {
    const addon = this.saveManager.getActiveAddon();
    if (addon.id !== 'wingmanDrones') return 0;
    const save = this.saveManager.state;
    return Math.max(1, getDroneCount(save.stats.highestWave, save.upgrades.firePower));
  }

  getBulletDamage() {
    return getBulletDamage(this.saveManager.state.upgrades.firePower);
  }

  getCoinMultiplier() {
    const base = getCoinMultiplier(
      this.saveManager.state.upgrades.coinValue,
      this.activePowerups.magnet > 0,
      this.gameMode === 'BOSS_RUSH'
    );
    const augMult = this.activeAugments?.includes('midasTouch') ? 1.35 : 1.0;
    return base * augMult;
  }

  isBossRushUnlocked() {
    return this.saveManager.state.stats.highestWave >= 6;
  }

  toggleGameMode() {
    if (!this.isBossRushUnlocked()) return false;
    this.gameMode = this.gameMode === 'STANDARD' ? 'BOSS_RUSH' : 'STANDARD';
    this.setupCurrentWave();
    this.bus.emit('mode:changed', this.gameMode);
    return true;
  }

  selectWave(delta) {
    if (this.gameState !== 'LOBBY') return false;
    const save = this.saveManager.state;
    const maxWave = Math.max(1, save.stats.highestWave || save.wave);
    const nextWave = Math.max(1, Math.min(maxWave, save.wave + delta));
    if (nextWave === save.wave) return false;
    save.wave = nextWave;
    this.saveManager.persist();
    this.setupCurrentWave();
    this.activeAugments = [];
    this.recalcMaxHull();
    this.hull = this.maxHull;
    this.bus.emit('augment:updated', this.activeAugments);
    this.bus.emit('hull:updated', { hull: this.hull, maxHull: this.maxHull });
    this.bus.emit('run:lobby');
    return true;
  }

  addUltimateCharge() {
    // Repetitive auto-Supernova removed so power-ups shine individually
  }

  activateUltimate() {
    return this.combatSystem.triggerUltimate(this);
  }

  // --- VFX & Drop Spawners ---
  spawnParticle(props) {
    this.particles.push(this.particlePool.acquire(props));
  }

  addParticles(x, y, color, count = 12, speed = 180) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.25 + Math.random() * 0.85) * speed;
      this.spawnParticle({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 40,
        r: 2.5 + Math.random() * 4.5,
        color,
        life: 1,
        decay: 1.6 + Math.random() * 1.4,
      });
    }
  }

  addShockwave(x, y, maxRadius, color) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius,
      color,
      life: 1,
    });
  }

  addFloatingText(x, y, text, color = '#ffcf33', size = 16) {
    this.floatingTexts.push(
      this.textPool.acquire({
        x,
        y,
        text,
        color,
        size,
        vy: -55,
        life: 1,
      })
    );
  }

  triggerShake(intensity = 6, duration = 0.18) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeTimer = Math.max(this.shakeTimer, duration);
  }

  maybeSpawnPowerup(x, y, guaranteed = false) {
    if (!guaranteed && Math.random() > POWERUP_DROP_CHANCE) return;
    const types = Object.keys(POWERUP_META);
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerups.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 90,
      vy: -130,
      radius: 15,
      type,
      bobPhase: Math.random() * Math.PI * 2,
      life: 9.5,
    });
  }

  activatePowerup(type, x, y) {
    const meta = POWERUP_META[type];
    if (!meta) return;
    const durBonus = this.saveManager.state.upgrades.offlineEarnings >= 20 ? 1.25 : 1.0;
    this.activePowerups[type] = meta.duration * durBonus;
    this.saveManager.state.stats.powerupsCollected += 1;
    this.bus.emit('powerup:collected', { type, meta });
    this.addParticles(x, y, meta.color, 18, 220);
    this.addFloatingText(
      x,
      y - 18,
      `${meta.icon} ${meta.label}: ${meta.hudDesc}!`,
      meta.color,
      14
    );
    this.achievementTracker.checkUnlockables();
    this.saveManager.persist();
    this.bus.emit('powerup:updated', this.activePowerups);
  }

  takeHullDamage(rock) {
    if (this.invulnerableTimer > 0 || this.activePowerups.shield > 0) return;
    if (rock.variant === 'tntBarrel' || rock.variant === 'goldGeode') {
      rock.vy = -450;
      return;
    }

    const dmg = rock.isBoss ? 2 : 1;
    this.hull = Math.max(0, this.hull - dmg);
    this.bus.emit('hull:updated', { hull: this.hull, maxHull: this.maxHull });

    if (this.hull > 0) {
      this.invulnerableTimer = 1.35;
      rock.vy = -510;
      rock.y = Math.min(rock.y, this.cannon.y - 45);
      this.triggerShake(9, 0.22);
      this.addShockwave(this.cannon.x, this.cannon.y - 24, 90, '#ff4757');
      this.addFloatingText(
        this.cannon.x,
        this.cannon.y - 44,
        `⚠️ HULL HIT! ${this.hull}/${this.maxHull} SHIELDS`,
        '#ff4757',
        14
      );
      this.bus.emit('sfx:hit', { hpRatio: 0.1, armored: true });
    } else {
      this.triggerGameOver(rock);
    }
  }

  activateAugment(augmentId) {
    if (!this.activeAugments) this.activeAugments = [];
    if (!this.activeAugments.includes(augmentId)) {
      this.activeAugments.push(augmentId);
    }
    if (augmentId === 'aegisPlating') {
      this.recalcMaxHull();
      this.hull = this.maxHull;
    } else {
      this.hull = Math.min(this.maxHull, this.hull + 1);
    }
    this.bus.emit('hull:updated', { hull: this.hull, maxHull: this.maxHull });
    this.bus.emit('augment:updated', this.activeAugments);
  }

  spawnCoinBurst(x, y, count = 3) {
    const wave = this.saveManager.state.wave;
    // Scale coin value with wave progression so upgrades stay affordable at Wave 30+
    const waveScale = 1 + wave * 0.75 + Math.pow(Math.max(0, wave - 10), 1.45) * 0.35;
    const baseValue = Math.max(1, Math.round(waveScale * this.getCoinMultiplier()));
    for (let i = 0; i < count; i++) {
      this.coins.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 14,
        vx: (Math.random() - 0.5) * 180,
        vy: -140 - Math.random() * 140,
        radius: 10,
        value: baseValue,
        spin: Math.random() * Math.PI * 2,
        life: 8.5,
      });
    }
  }

  awardCoins(amount, popupX = null, popupY = null) {
    const save = this.saveManager.state;
    save.coins += amount;
    save.stats.totalCoinsEarned += amount;
    this.runCoins += amount;
    this.saveManager.persist();
    this.achievementTracker.checkUnlockables();

    this.bus.emit('coins:awarded', { amount, totalCoins: save.coins });

    if (popupX !== null && popupY !== null) {
      this.addFloatingText(popupX, popupY, `+${formatNum(amount)} 🪙`, '#ffcf33', 15);
    }
  }

  buyUpgrade(type) {
    const save = this.saveManager.state;
    const cost = getUpgradeCost(type, save.upgrades[type]);
    if (save.coins < cost) return false;

    save.coins -= cost;
    save.upgrades[type] += 1;
    save.stats.upgradesBought += 1;
    this.saveManager.persist();

    this.addParticles(this.cannon.x, this.cannon.y - 26, '#ffcf33', 16, 200);
    this.bus.emit('upgrade:purchased', { type, level: save.upgrades[type] });
    return true;
  }

  // --- Run Lifecycle ---
  setupCurrentWave() {
    const save = this.saveManager.state;
    if (save.wave > save.stats.highestWave) {
      save.stats.highestWave = save.wave;
      this.saveManager.persist();
    }
    this.waveSystem.setupWave(
      save.wave,
      this.gameState === 'PLAYING',
      Math.random,
      this.gameMode === 'BOSS_RUSH'
    );
  }

  startRun() {
    if (this.gameState !== 'LOBBY' || this.intermissionLockTimer > 0) return;
    this.gameState = 'PLAYING';
    this.saveManager.state.stats.runsPlayed += 1;
    this.saveManager.persist();
    this.recalcMaxHull();
    this.hull = this.maxHull;
    this.bus.emit('hull:updated', { hull: this.hull, maxHull: this.maxHull });
    this.setupCurrentWave();
    this.bus.emit('run:started');
    this.bus.emit('ultimate:updated', this.ultimateCharge);
  }

  pauseGame() {
    if (this.gameState !== 'PLAYING') return;
    this.gameState = 'PAUSED';
    this.bus.emit('run:paused', {
      wave: this.saveManager.state.wave,
      score: this.score,
      coins: this.saveManager.state.coins,
    });
  }

  resumeGame() {
    if (this.gameState !== 'PAUSED') return;
    this.gameState = 'PLAYING';
    this.bus.emit('run:resumed');
  }

  onWaveComplete() {
    const save = this.saveManager.state;
    const clearedWave = save.wave;
    const isMilestone = clearedWave % 10 === 0;
    const waveBonusScale = 25 + clearedWave * 22 + Math.pow(Math.max(0, clearedWave - 10), 1.5) * 6;
    const waveBonus = Math.round(
      waveBonusScale * (isMilestone ? 2.5 : 1) * this.getCoinMultiplier()
    );

    // Auto-collect any remaining coins and power-ups on the field
    for (const c of this.coins) {
      this.awardCoins(c.value, c.x, c.y - 10);
    }
    this.coins = [];

    for (const p of this.powerups) {
      this.activatePowerup(p.type, p.x, p.y);
    }
    this.powerups = [];

    this.bullets.forEach((b) => this.bulletPool.release(b));
    this.bullets = [];

    save.wave += 1;
    if (save.wave > save.stats.highestWave) {
      save.stats.highestWave = save.wave;
    }
    this.awardCoins(waveBonus);

    // Full Hull repair between waves
    this.recalcMaxHull();
    this.hull = this.maxHull;
    this.bus.emit('hull:updated', { hull: this.hull, maxHull: this.maxHull });

    // Boss Wave Cleared (every 3 waves or in Boss Rush): Offer 3 Tactical Augments
    const isBossCleared = clearedWave % 3 === 0 || this.gameMode === 'BOSS_RUSH';
    if (isBossCleared && TACTICAL_AUGMENTS && TACTICAL_AUGMENTS.length > 0) {
      const pool = TACTICAL_AUGMENTS.filter((a) => !this.activeAugments?.includes(a.id));
      const candidates = pool.length >= 3 ? pool : TACTICAL_AUGMENTS;
      const shuffled = [...candidates].sort(() => 0.5 - Math.random());
      const options = shuffled.slice(0, 3);
      this.bus.emit('augment:offered', { options, clearedWave });
    }

    // Pause between waves in LOBBY state so the player gets a breather & can buy upgrades
    this.gameState = 'LOBBY';
    this.intermissionLockTimer = 0.55;

    this.bus.emit('wave:cleared', {
      clearedWave,
      nextWave: save.wave,
      isMilestone,
      waveBonus,
    });

    this.setupCurrentWave();
    this.activeAugments = [];
    this.recalcMaxHull();
    this.hull = this.maxHull;
    this.bus.emit('augment:updated', this.activeAugments);
    this.bus.emit('hull:updated', { hull: this.hull, maxHull: this.maxHull });
    this.bus.emit('run:lobby');
  }

  triggerGameOver(fatalRock = null) {
    if (this.gameState === 'GAMEOVER' || this.gameState === 'DYING') return;
    this.gameState = 'DYING';
    this.deathSlowMoTimer = 0.38;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.bus.emit('combo:updated', { count: 0, multiplier: 1 });
    this.triggerShake(16, 0.38);
    this.addShockwave(this.cannon.x, this.cannon.y - 24, 115, '#ff4757');
    this.addParticles(this.cannon.x, this.cannon.y - 18, '#ff4757', 24, 260);
    this.addParticles(this.cannon.x, this.cannon.y - 18, '#38b6ff', 18, 220);
    if (fatalRock) {
      fatalRock.hitFlash = 0.8;
      fatalRock.hitScale = 1.25;
    }
  }

  finalizeGameOver() {
    if (this.gameState === 'GAMEOVER') return;
    this.gameState = 'GAMEOVER';
    this.bus.emit('run:gameover', {
      wave: this.saveManager.state.wave,
      score: this.score,
      runCoins: this.runCoins,
      usedRevive: this.usedRevive,
    });
  }

  reviveRun() {
    this.usedRevive = true;
    this.deathSlowMoTimer = 0;
    this.invulnerableTimer = PHYSICS.REVIVE_SHIELD_DURATION;
    this.gameState = 'PLAYING';

    this.rocks.forEach((r) => {
      r.vy = -440;
      r.y = Math.min(r.y, this.groundY - 220);
      r.hitScale = 1.3;
      r.hitFlash = 0.6;
    });

    this.triggerShake(10, 0.25);
    this.addParticles(this.cannon.x, this.cannon.y - 20, '#48dbfb', 30, 300);
    this.bus.emit('run:revived');
  }

  returnToLobby() {
    this.gameState = 'LOBBY';
    this.score = 0;
    this.runCoins = 0;
    this.usedRevive = false;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.ultimateCharge = 0;
    this.ultimateBeamTimer = 0;
    Object.keys(this.activePowerups).forEach((k) => (this.activePowerups[k] = 0));

    this.bullets.forEach((b) => this.bulletPool.release(b));
    this.particles.forEach((p) => this.particlePool.release(p));
    this.floatingTexts.forEach((ft) => this.textPool.release(ft));

    this.bullets = [];
    this.rocks = [];
    this.powerups = [];
    this.particles = [];
    this.shockwaves = [];
    this.laserBeams = [];
    this.floatingTexts = [];

    this.setupCurrentWave();
    this.activeAugments = [];
    this.recalcMaxHull();
    this.hull = this.maxHull;
    this.bus.emit('augment:updated', this.activeAugments);
    this.bus.emit('hull:updated', { hull: this.hull, maxHull: this.maxHull });
    this.bus.emit('run:lobby');
    this.bus.emit('combo:updated', { count: 0, multiplier: 1 });
    this.bus.emit('ultimate:updated', this.ultimateCharge);
    this.bus.emit('powerup:updated', this.activePowerups);
  }

  // --- Frame Tick ---
  update(dt, inputSystem, isModalOpen = false) {
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) this.shakeIntensity = 0;
    }

    if (this.intermissionLockTimer > 0) {
      this.intermissionLockTimer = Math.max(0, this.intermissionLockTimer - dt);
    }

    if (this.ultimateBeamTimer > 0) {
      this.ultimateBeamTimer = Math.max(0, this.ultimateBeamTimer - dt);
    }

    if (this.gameState === 'PAUSED' || isModalOpen) {
      return;
    }

    if (this.gameState === 'DYING') {
      this.deathSlowMoTimer -= dt;
      this.physicsSystem.updateVFX(dt * 0.4, this);
      if (this.deathSlowMoTimer <= 0) {
        this.finalizeGameOver();
      }
      return;
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    if (this.gameState === 'PLAYING') {
      // Tick active power-up durations
      let powerupChanged = false;
      for (const key of Object.keys(this.activePowerups)) {
        if (this.activePowerups[key] > 0) {
          this.activePowerups[key] = Math.max(0, this.activePowerups[key] - dt);
          powerupChanged = true;
        }
      }
      if (powerupChanged) {
        this.bus.emit('powerup:updated', this.activePowerups);
      }

      // Tick Combo decay timer
      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.comboCount = 0;
          this.bus.emit('combo:updated', { count: 0, multiplier: 1 });
        }
      }
    }

    const targetGroundH =
      this.gameState === 'LOBBY'
        ? PHYSICS.LOBBY_GROUND_HEIGHT || PHYSICS.GROUND_HEIGHT
        : PHYSICS.GROUND_HEIGHT;
    const targetGroundY = this.height - targetGroundH;
    if (!Number.isFinite(this.groundY)) {
      this.groundY = targetGroundY;
    } else if (Math.abs(this.groundY - targetGroundY) > 0.5) {
      this.groundY += (targetGroundY - this.groundY) * Math.min(1, dt * 12);
    } else {
      this.groundY = targetGroundY;
    }
    this.cannon.y = this.groundY;

    const keyDir = this.gameState !== 'GAMEOVER' ? inputSystem.getKeyMoveDirection() : 0;
    this.cannon.update(dt, this.width, keyDir);

    if (this.gameState === 'PLAYING' && inputSystem.isFiring()) {
      const fireInterval = 1 / this.getFireRateShotsPerSec();
      if (this.cannon.shootCooldown <= 0) {
        this.cannon.shootCooldown = fireInterval;
        this.combatSystem.fireVolley(this);
      }

      if (this.cannon.droneCooldown <= 0 && this.getDroneCount() > 0) {
        this.cannon.droneCooldown = COMBAT.DRONE_FIRE_INTERVAL;
        this.combatSystem.fireDrones(this);
      }

      if (
        this.cannon.teslaCooldown <= 0 &&
        this.saveManager.getActiveAddon().id === 'teslaCoil' &&
        this.rocks.length > 0
      ) {
        this.cannon.teslaCooldown = 1.3;
        this.combatSystem.fireTeslaCoil(this);
      }
    }

    if (this.gameState === 'PLAYING') {
      this.waveSystem.update(dt, this.saveManager.state.wave, this.rocks, this.width);
    }

    this.combatSystem.updateBullets(dt, this);
    this.physicsSystem.updateRocks(dt, this);
    this.physicsSystem.updatePowerups(dt, this);
    this.physicsSystem.updateCoins(dt, this);
    this.physicsSystem.updateVFX(dt, this);

    const activeBoss = this.rocks.find((r) => r.isBoss) || null;
    this.bus.emit('boss:tick', { boss: activeBoss, isPlaying: this.gameState === 'PLAYING' });
  }
}
