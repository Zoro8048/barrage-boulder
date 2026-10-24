/**
 * CombatSystem - Handles volley firing (across all Cannon Varieties & Power-Ups),
 * Wingman Drone targeting, Tesla Pylon zaps, Critical Hits, Combo multipliers,
 * Ultimate Supernova Beam, armor cracking, rock splitting, and boss skills.
 */

import { PHYSICS, COMBAT } from '../config/constants.js';
import { ROCK_VARIANTS, getRockColorTier } from '../config/rockVariants.js';
import { createRock } from '../entities/Rock.js';
import { getComboMultiplier } from '../state/UpgradeMath.js';
import { formatNum } from '../core/utils.js';

export class CombatSystem {
  constructor(bus) {
    this.bus = bus;
  }

  fireVolley(engine) {
    const { cannon, bullets, bulletPool, activePowerups, saveManager } = engine;
    const variety = saveManager.getActiveCannon();
    const baseBarrels = engine.getBarrelCount();
    const barrels = Math.max(1, baseBarrels + (variety.extraBarrels || 0));
    const spacing = 11;
    const totalSpan = (barrels - 1) * spacing;

    const isOverdrive = activePowerups.rapidFire > 0;
    const isGiant = activePowerups.giantBullets > 0;
    const isPierce = activePowerups.piercingLaser > 0;
    const isExplosive = activePowerups.explosiveRounds > 0;
    const isSpreadPowerup = activePowerups.spreadShot > 0;

    const speed =
      variety.id === 'railgun'
        ? -980
        : isOverdrive
        ? PHYSICS.BULLET_SPEED_OVERDRIVE
        : PHYSICS.BULLET_SPEED_NORMAL;

    const pierceLeft = (isPierce ? 3 : 0) + (variety.pierceCount || 0);
    const splashRadius = isExplosive ? 95 : variety.splashRadius || 0;
    const dmgRatio = (variety.damageMult || 1) * (isGiant ? 2.0 : 1.0);
    const bulletRadius = isGiant ? 10 : variety.id === 'railgun' ? 7 : isOverdrive ? 6.2 : 5.5;

    for (let i = 0; i < barrels; i++) {
      const offsetX = -totalSpan / 2 + i * spacing;
      const normIdx = barrels > 1 ? i / (barrels - 1) - 0.5 : 0;
      const angle = normIdx * (variety.spreadAngle || 0);
      const vx = Math.sin(angle) * Math.abs(speed) + offsetX * 1.2;
      const vy = -Math.cos(angle) * Math.abs(speed);

      bullets.push(
        bulletPool.acquire({
          x: cannon.x + offsetX,
          y: cannon.y - 48,
          vx,
          vy,
          radius: bulletRadius,
          overdrive: isOverdrive,
          isGiant,
          isPierce: pierceLeft > 0,
          pierceLeft,
          splashRadius,
          lastHitRock: null,
          isDrone: false,
          damageRatio: dmgRatio,
        })
      );
    }

    // Spread Fan Power-Up adds 2 angled wing shots
    if (isSpreadPowerup) {
      for (const sideAngle of [-0.26, 0.26]) {
        bullets.push(
          bulletPool.acquire({
            x: cannon.x,
            y: cannon.y - 46,
            vx: Math.sin(sideAngle) * Math.abs(speed),
            vy: -Math.cos(sideAngle) * Math.abs(speed),
            radius: bulletRadius * 0.9,
            overdrive: isOverdrive,
            isGiant,
            isPierce: pierceLeft > 0,
            pierceLeft,
            splashRadius,
            lastHitRock: null,
            isDrone: false,
            damageRatio: dmgRatio * 0.85,
          })
        );
      }
    }

    cannon.recoil = variety.id === 'railgun' ? 9 : 6;
    cannon.muzzleFlash = 1;
    this.bus.emit('sfx:shoot', { overdrive: isOverdrive });
  }

  fireDrones(engine) {
    const { cannon, rocks, bullets, bulletPool } = engine;
    const droneCount = engine.getDroneCount();
    if (droneCount <= 0 || rocks.length === 0) return;

    let target = rocks[0];
    for (const r of rocks) {
      if (r.y + r.radius > target.y + target.radius) {
        target = r;
      }
    }

    const offsets = droneCount >= 2 ? [-44, 44] : [-44];
    const bobY = Math.sin(cannon.droneBobPhase) * 4;

    for (const ox of offsets) {
      const sx = cannon.x + ox;
      const sy = cannon.y - 34 + bobY;
      const dx = target.x - sx;
      const dy = target.y - sy;
      const dist = Math.hypot(dx, dy) || 1;

      bullets.push(
        bulletPool.acquire({
          x: sx,
          y: sy,
          vx: (dx / dist) * COMBAT.DRONE_BULLET_SPEED,
          vy: (dy / dist) * COMBAT.DRONE_BULLET_SPEED,
          radius: 4.8,
          overdrive: false,
          isGiant: false,
          isPierce: false,
          pierceLeft: 0,
          splashRadius: 0,
          lastHitRock: null,
          isDrone: true,
          damageRatio: COMBAT.DRONE_DAMAGE_RATIO,
        })
      );
    }
  }

  fireTeslaCoil(engine) {
    const { cannon, rocks } = engine;
    if (rocks.length === 0) return;
    const target = rocks[Math.floor(Math.random() * rocks.length)];
    const zapDmg = Math.max(2, Math.round(engine.getBulletDamage() * 2.2));

    cannon.teslaArc = {
      targetX: target.x,
      targetY: target.y,
      timer: 0.18,
    };

    this.applyDamageToRock(target, zapDmg, engine, { isCrit: false, isZap: true });
    engine.addParticles(target.x, target.y, '#48dbfb', 6, 150);
  }

  applyDamageToRock(r, rawDmg, engine, { isCrit = false, isZap = false } = {}) {
    const { rocks, saveManager, waveSystem } = engine;
    const save = saveManager.state;
    const idx = rocks.indexOf(r);
    if (idx === -1) return 0;

    if (r.bossShieldTimer > 0) {
      this.bus.emit('sfx:hit', { hpRatio: 1, armored: true });
      return 0;
    }

    const hasIntactArmor = r.variant === 'armored' && !r.armorBroken;
    const armorScale = ROCK_VARIANTS.armored.armorDamageScale;
    const afterArmor = hasIntactArmor ? Math.max(1, Math.round(rawDmg * armorScale)) : rawDmg;
    const actualDmg = Math.min(r.hp, afterArmor);

    r.hp -= actualDmg;

    engine.comboCount += 1;
    engine.comboTimer = COMBAT.COMBO_DECAY_TIME;
    const comboMult = getComboMultiplier(engine.comboCount);
    const scoreGain = Math.round(actualDmg * comboMult);

    engine.score += scoreGain;
    waveSystem.waveDamageDealt += actualDmg;
    if (engine.score > save.bestScore) {
      save.bestScore = engine.score;
    }

    engine.addUltimateCharge(COMBAT.ULTIMATE_CHARGE_PER_HIT);

    if (isCrit) {
      engine.addFloatingText(r.x, r.y - 12, `💥 ${formatNum(actualDmg)}!`, '#ff4757', 14);
    } else if (isZap) {
      engine.addFloatingText(r.x, r.y - 10, `⚡ ${formatNum(actualDmg)}`, '#48dbfb', 13);
    }

    if (
      hasIntactArmor &&
      r.hp <= r.maxHp * ROCK_VARIANTS.armored.armorBreakThreshold &&
      r.hp > 0
    ) {
      r.armorBroken = true;
      engine.addParticles(r.x, r.y, '#dfe4ea', 14, 200);
      engine.addFloatingText(r.x, r.y - r.radius, 'ARMOR CRACKED!', '#dfe4ea', 13);
    }

    r.hitScale = isCrit ? 1.22 : 1.15;
    r.hitFlash = 0.22;

    if (r.hp <= 0) {
      this.destroyRock(r, idx, engine, false);
    }

    this.bus.emit('hud:scoreUpdated');
    this.bus.emit('combo:updated', {
      count: engine.comboCount,
      multiplier: comboMult,
    });
    this.bus.emit('wave:updated', {
      waveNum: save.wave,
      damageDealt: waveSystem.waveDamageDealt,
      totalHP: waveSystem.waveTotalHP,
    });

    return actualDmg;
  }

  triggerUltimate(engine) {
    if (engine.gameState !== 'PLAYING' || engine.ultimateCharge < 100) return false;

    engine.ultimateCharge = 0;
    engine.ultimateBeamTimer = COMBAT.ULTIMATE_BEAM_DURATION;
    engine.invulnerableTimer = Math.max(engine.invulnerableTimer, 2.0);
    engine.triggerShake(15, 0.4);
    engine.addShockwave(engine.cannon.x, engine.cannon.y - 40, 420, 'rgba(72, 219, 251, 0.9)');
    engine.addFloatingText(
      engine.width / 2,
      engine.height * 0.36,
      '☄️ ORBITAL SUPERNOVA!',
      '#48dbfb',
      20
    );

    const ultDamage = Math.max(15, Math.round(engine.getBulletDamage() * 14));
    const save = engine.saveManager.state;

    for (let j = engine.rocks.length - 1; j >= 0; j--) {
      const r = engine.rocks[j];
      r.armorBroken = true;
      r.bossShieldTimer = 0;
      const actualDmg = Math.min(r.hp, ultDamage);
      r.hp -= actualDmg;
      engine.score += actualDmg;
      engine.waveSystem.waveDamageDealt += actualDmg;
      if (engine.score > save.bestScore) {
        save.bestScore = engine.score;
      }

      r.vy = -480;
      r.hitScale = 1.3;
      r.hitFlash = 0.6;
      engine.addParticles(r.x, r.y, '#48dbfb', 10, 220);

      if (r.hp <= 0) {
        this.destroyRock(r, j, engine, true);
      }
    }

    this.bus.emit('sfx:ultimate');
    this.bus.emit('ultimate:updated', engine.ultimateCharge);
    this.bus.emit('hud:scoreUpdated');
    this.bus.emit('wave:updated', {
      waveNum: save.wave,
      damageDealt: engine.waveSystem.waveDamageDealt,
      totalHP: engine.waveSystem.waveTotalHP,
    });
    return true;
  }

  updateBullets(dt, engine) {
    const { bullets, bulletPool, rocks, width, saveManager } = engine;
    const baseBulletDmg = engine.getBulletDamage();
    const variety = saveManager.getActiveCannon();
    const addon = saveManager.getActiveAddon();

    const critChance =
      COMBAT.CRIT_CHANCE +
      (variety.critBonus || 0) +
      (addon.id === 'laserSight' ? 0.18 : 0);
    const critMult = COMBAT.CRIT_MULTIPLIER + (addon.id === 'laserSight' ? 0.5 : 0);

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.y < -30 || b.y > engine.height + 20 || b.x < -20 || b.x > width + 20) {
        bullets.splice(i, 1);
        bulletPool.release(b);
        continue;
      }

      let consumeBullet = false;
      for (let j = rocks.length - 1; j >= 0; j--) {
        const r = rocks[j];
        if (b.lastHitRock === r) continue;

        const distSq = (b.x - r.x) ** 2 + (b.y - r.y) ** 2;
        if (distSq <= (r.radius + b.radius) ** 2) {
          b.lastHitRock = r;

          const isCrit = !b.isDrone && Math.random() < critChance;
          const mult = isCrit ? critMult : 1.0;
          const scaledDmg = Math.max(1, Math.round(baseBulletDmg * (b.damageRatio || 1) * mult));

          const hasIntactArmor = r.variant === 'armored' && !r.armorBroken;
          if (r.vy > -120) r.vy -= b.isGiant ? 28 : 12;

          this.bus.emit('sfx:hit', { hpRatio: r.hp / r.maxHp, armored: hasIntactArmor });
          engine.addParticles(
            b.x,
            b.y,
            isCrit ? '#ff4757' : hasIntactArmor ? '#dfe4ea' : '#fffa65',
            isCrit ? 6 : 3,
            110
          );

          this.applyDamageToRock(r, scaledDmg, engine, { isCrit });

          // Area Splash Damage (Explosive Rounds Power-Up or Siege Blast Cannon)
          if (b.splashRadius > 0) {
            engine.addShockwave(b.x, b.y, b.splashRadius, 'rgba(255, 118, 117, 0.75)');
            const splashDmg = Math.max(1, Math.round(scaledDmg * 0.5));
            for (let k = rocks.length - 1; k >= 0; k--) {
              const other = rocks[k];
              if (!other || other === r) continue;
              const d = Math.hypot(other.x - b.x, other.y - b.y);
              if (d <= b.splashRadius + other.radius) {
                this.applyDamageToRock(other, splashDmg, engine, { isCrit: false });
              }
            }
          }

          if (b.pierceLeft > 0) {
            b.pierceLeft -= 1;
          } else {
            consumeBullet = true;
          }
          break;
        }
      }

      if (consumeBullet) {
        bullets.splice(i, 1);
        bulletPool.release(b);
      }
    }
  }

  destroyRock(rock, index, engine, fromUltimate = false) {
    const { rocks, saveManager, waveSystem, achievementTracker } = engine;
    const save = saveManager.state;
    const col = getRockColorTier(rock.maxHp);

    engine.addParticles(rock.x, rock.y, col.fill, rock.size * 8, 220);
    this.bus.emit('rock:destroyed', { size: rock.size, isBoss: rock.isBoss });
    engine.triggerShake(rock.size * 3.5, 0.16);

    if (!fromUltimate) {
      engine.addUltimateCharge(COMBAT.ULTIMATE_CHARGE_PER_KILL);
    }

    save.stats.rocksDestroyed += 1;
    if (rock.isBoss) {
      save.stats.bossesDefeated += 1;
      engine.maybeSpawnPowerup(rock.x, rock.y, true);
      engine.spawnCoinBurst(rock.x, rock.y, rock.isMilestone ? 12 : 6);
    } else if (rock.size === 1) {
      engine.maybeSpawnPowerup(rock.x, rock.y, false);
    }

    rocks.splice(index, 1);

    if (rock.size > 1) {
      const childSize = rock.size - 1;
      const childHp = Math.max(1, Math.floor(rock.maxHp * 0.5));
      const spreadVx = (rock.variant === 'fast' ? 115 : 80) + Math.random() * 35;
      const popVyLeft = -315 - Math.random() * 45;
      const popVyRight = -225 - Math.random() * 40;
      const childVariant =
        rock.variant === 'boss' || rock.variant === 'milestoneBoss' ? 'normal' : rock.variant;

      rocks.push(
        createRock({
          x: rock.x - 12,
          y: rock.y,
          vx: -spreadVx,
          vy: popVyLeft,
          size: childSize,
          hp: childHp,
          isBoss: false,
          variant: childVariant,
          fromSplit: true,
        }),
        createRock({
          x: rock.x + 12,
          y: rock.y,
          vx: spreadVx * (0.88 + Math.random() * 0.24),
          vy: popVyRight,
          size: childSize,
          hp: childHp,
          isBoss: false,
          variant: childVariant,
          fromSplit: true,
        })
      );
      engine.spawnCoinBurst(rock.x, rock.y, 1);
    } else {
      engine.spawnCoinBurst(rock.x, rock.y, rock.variant === 'healer' ? 5 : 3);
    }

    achievementTracker.checkUnlockables();

    if (
      rocks.length === 0 &&
      waveSystem.waveRocksToSpawn.length === 0 &&
      engine.gameState === 'PLAYING'
    ) {
      engine.onWaveComplete();
    }
  }

  triggerRockSpecialAbility(r, engine) {
    const { rocks, waveSystem, saveManager } = engine;

    if (r.variant === 'healer') {
      const cfg = ROCK_VARIANTS.healer;
      let healedAny = false;
      for (const other of rocks) {
        if (other === r) continue;
        const dist = Math.hypot(other.x - r.x, other.y - r.y);
        if (dist < cfg.healRadius && other.hp < other.maxHp) {
          const healAmt = Math.max(1, Math.round(other.maxHp * cfg.healFraction));
          const actualHeal = Math.min(other.maxHp - other.hp, healAmt);
          other.hp += actualHeal;
          waveSystem.waveDamageDealt = Math.max(0, waveSystem.waveDamageDealt - actualHeal);
          healedAny = true;
          engine.addFloatingText(
            other.x,
            other.y - other.radius,
            `+${formatNum(actualHeal)} 💚`,
            '#2ed573',
            13
          );
        }
      }
      engine.addShockwave(r.x, r.y, 150, 'rgba(46, 213, 115, 0.65)');
      if (healedAny) {
        this.bus.emit('wave:updated', {
          waveNum: saveManager.state.wave,
          damageDealt: waveSystem.waveDamageDealt,
          totalHP: waveSystem.waveTotalHP,
        });
      }
      r.abilityTimer = cfg.abilityInterval;
    } else if (r.isMilestone) {
      if (Math.random() < 0.5 && rocks.length < 7) {
        const miniHp = Math.max(2, Math.round(r.maxHp * 0.12));
        waveSystem.waveTotalHP += miniHp * 2;
        for (const dir of [-1, 1]) {
          rocks.push(
            createRock({
              x: r.x + dir * 24,
              y: r.y,
              vx: dir * 135,
              vy: -220,
              size: 1,
              hp: miniHp,
              variant: 'fast',
              fromSplit: true,
            })
          );
        }
        engine.addShockwave(r.x, r.y, 130, 'rgba(255, 71, 87, 0.75)');
        engine.addFloatingText(r.x, r.y - r.radius - 14, '☄️ METEOR SWARM!', '#ff4757', 15);
      } else {
        r.bossShieldTimer = 2.0;
        engine.addShockwave(r.x, r.y, 110, 'rgba(72, 219, 251, 0.8)');
        engine.addFloatingText(r.x, r.y - r.radius - 14, '🛡️ TITAN AEGIS!', '#48dbfb', 15);
      }
      r.abilityTimer = ROCK_VARIANTS.milestoneBoss.abilityInterval;
    } else if (r.isBoss) {
      r.vx = (r.vx > 0 ? 1 : -1) * 145;
      r.vy = -320;
      engine.addShockwave(r.x, r.y, 105, 'rgba(217, 128, 250, 0.7)');
      r.abilityTimer = ROCK_VARIANTS.boss.abilityInterval;
    }
  }
}
