/**
 * GameEngine - Central Simulation Coordinator
 */

import { PHYSICS } from '../config/constants.js';
import { POWERUP_META, POWERUP_DROP_CHANCE } from '../config/powerups.js';
import { ObjectPool } from './ObjectPool.js';
import { formatNum } from './utils.js';
import {
  getUpgradeCost,
  getFireRateShotsPerSec,
  getBarrelCount,
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
    this.score = 0;
    this.runCoins = 0;
    this.usedRevive = false;
    this.invulnerableTimer = 0;
    this.intermissionLockTimer = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;

    this.activePowerups = {
      rapidFire: 0,
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
    this.floatingTexts = [];

    // Object Pools for high-frequency objects
    this.bulletPool = new ObjectPool(() => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 5.5,
      overdrive: false,
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
    this.groundY = height - PHYSICS.GROUND_HEIGHT;
    this.cannon.setBounds(width, this.groundY);
  }

  // --- Computed Stats ---
  getFireRateShotsPerSec() {
    return getFireRateShotsPerSec(
      this.saveManager.state.upgrades.fireRate,
      this.activePowerups.rapidFire > 0
    );
  }

  getBarrelCount() {
    return getBarrelCount(this.saveManager.state.upgrades.fireRate);
  }

  getBulletDamage() {
    return getBulletDamage(this.saveManager.state.upgrades.firePower);
  }

  getCoinMultiplier() {
    return getCoinMultiplier(
      this.saveManager.state.upgrades.coinValue,
      this.activePowerups.magnet > 0
    );
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
    this.activePowerups[type] = meta.duration;
    this.saveManager.state.stats.powerupsCollected += 1;
    this.bus.emit('powerup:collected', { type, meta });
    this.addParticles(x, y, meta.color, 18, 220);
    this.addFloatingText(x, y - 16, `${meta.icon} ${meta.label}!`, meta.color, 16);
    this.achievementTracker.checkUnlockables();
    this.saveManager.persist();
    this.bus.emit('powerup:updated', this.activePowerups);
  }

  spawnCoinBurst(x, y, count = 3) {
    const wave = this.saveManager.state.wave;
    const baseValue = Math.max(1, Math.round((1 + wave * 0.6) * this.getCoinMultiplier()));
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
    this.waveSystem.setupWave(save.wave, this.gameState === 'PLAYING');
  }

  startRun() {
    if (this.gameState !== 'LOBBY' || this.intermissionLockTimer > 0) return;
    this.gameState = 'PLAYING';
    this.saveManager.state.stats.runsPlayed += 1;
    this.saveManager.persist();
    this.setupCurrentWave();
    this.bus.emit('run:started');
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
    const waveBonus = Math.round(
      (25 + clearedWave * 18) * (isMilestone ? 2.5 : 1) * this.getCoinMultiplier()
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
    this.bus.emit('run:lobby');
  }

  triggerGameOver() {
    if (this.gameState === 'GAMEOVER') return;
    this.gameState = 'GAMEOVER';
    this.triggerShake(14, 0.35);
    this.addParticles(this.cannon.x, this.cannon.y - 18, '#38b6ff', 28, 280);

    this.bus.emit('run:gameover', {
      wave: this.saveManager.state.wave,
      score: this.score,
      runCoins: this.runCoins,
      usedRevive: this.usedRevive,
    });
  }

  reviveRun() {
    this.usedRevive = true;
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
    Object.keys(this.activePowerups).forEach((k) => (this.activePowerups[k] = 0));

    this.bullets.forEach((b) => this.bulletPool.release(b));
    this.particles.forEach((p) => this.particlePool.release(p));
    this.floatingTexts.forEach((ft) => this.textPool.release(ft));

    this.bullets = [];
    this.rocks = [];
    this.powerups = [];
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];

    this.setupCurrentWave();
    this.bus.emit('run:lobby');
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

    // Freeze simulation while paused or while a modal dialog is open
    if (this.gameState === 'PAUSED' || isModalOpen) {
      return;
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Tick active power-up durations only during active combat
    if (this.gameState === 'PLAYING') {
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
    }

    const keyDir = this.gameState !== 'GAMEOVER' ? inputSystem.getKeyMoveDirection() : 0;
    this.cannon.update(dt, this.width, keyDir);

    if (this.gameState === 'PLAYING' && inputSystem.isFiring()) {
      const fireInterval = 1 / this.getFireRateShotsPerSec();
      if (this.cannon.shootCooldown <= 0) {
        this.cannon.shootCooldown = fireInterval;
        this.combatSystem.fireVolley(this);
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
