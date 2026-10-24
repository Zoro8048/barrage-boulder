/**
 * CombatSystem - Handles volley firing, Wingman Drone targeting, Critical Hits,
 * Combo multipliers, Ultimate Supernova Beam, armor cracking, rock splitting, and boss skills.
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
    const { cannon, bullets, bulletPool } = engine;
    const barrels = engine.getBarrelCount();
    const spacing = 11;
    const totalSpan = (barrels - 1) * spacing;
    const isOverdrive = engine.activePowerups.rapidFire > 0;

    for (let i = 0; i < barrels; i++) {
      const offsetX = -totalSpan / 2 + i * spacing;
      bullets.push(
        bulletPool.acquire({
          x: cannon.x + offsetX,
          y: cannon.y - 48,
          vx: offsetX * 1.4,
          vy: isOverdrive ? PHYSICS.BULLET_SPEED_OVERDRIVE : PHYSICS.BULLET_SPEED_NORMAL,
          radius: isOverdrive ? 6.2 : 5.5,
          overdrive: isOverdrive,
          isDrone: false,
          damageRatio: 1.0,
        })
      );
    }

    cannon.recoil = 6;
    cannon.muzzleFlash = 1;
    this.bus.emit('sfx:shoot', { overdrive: isOverdrive });
  }

  fireDrones(engine) {
    const { cannon, rocks, bullets, bulletPool } = engine;
    const droneCount = engine.getDroneCount();
    if (droneCount <= 0 || rocks.length === 0) return;

    // Target the boulder closest to the ground
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
          isDrone: true,
          damageRatio: COMBAT.DRONE_DAMAGE_RATIO,
        })
      );
    }
  }

  triggerUltimate(engine) {
    if (engine.gameState !== 'PLAYING' || engine.ultimateCharge < 100) return false;

    engine.ultimateCharge = 0;
    engine.ultimateBeamTimer = COMBAT.ULTIMATE_BEAM_DURATION;
    engine.invulnerableTimer = Math.max(engine.invulnerableTimer, 2.0);
    engine.triggerShake(15, 0.4);
    engine.addShockwave(engine.cannon.x, engine.cannon.y - 40, 420, 'rgba(72, 219, 251, 0.9)');
    engine.addFloatingText(engine.width / 2, engine.height * 0.36, '☄️ ORBITAL SUPERNOVA!', '#48dbfb', 20);

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
    const { bullets, bulletPool, rocks, width, saveManager, waveSystem } = engine;
    const save = saveManager.state;
    const baseBulletDmg = engine.getBulletDamage();

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.y < -30 || b.y > engine.height + 20 || b.x < -20 || b.x > width + 20) {
        bullets.splice(i, 1);
        bulletPool.release(b);
        continue;
      }

      let hit = false;
      for (let j = rocks.length - 1; j >= 0; j--) {
        const r = rocks[j];
        const distSq = (b.x - r.x) ** 2 + (b.y - r.y) ** 2;
        if (distSq <= (r.radius + b.radius) ** 2) {
          hit = true;

          if (r.bossShieldTimer > 0) {
            this.bus.emit('sfx:hit', { hpRatio: 1, armored: true });
            engine.addParticles(b.x, b.y, '#48dbfb', 4, 110);
            break;
          }

          // Roll Critical Hit
          const isCrit = !b.isDrone && Math.random() < COMBAT.CRIT_CHANCE;
          const critMult = isCrit ? COMBAT.CRIT_MULTIPLIER : 1.0;
          const scaledDmg = Math.max(1, Math.round(baseBulletDmg * (b.damageRatio || 1) * critMult));

          const hasIntactArmor = r.variant === 'armored' && !r.armorBroken;
          const armorScale = ROCK_VARIANTS.armored.armorDamageScale;
          const rawDmg = hasIntactArmor ? Math.max(1, Math.round(scaledDmg * armorScale)) : scaledDmg;
          const actualDmg = Math.min(r.hp, rawDmg);

          r.hp -= actualDmg;

          // Build Combo & Ultimate Charge
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
            engine.addFloatingText(
              b.x,
              b.y - 12,
              `💥 ${formatNum(actualDmg)}!`,
              '#ff4757',
              14
            );
          }

          if (hasIntactArmor && r.hp <= r.maxHp * ROCK_VARIANTS.armored.armorBreakThreshold && r.hp > 0) {
            r.armorBroken = true;
            engine.addParticles(r.x, r.y, '#dfe4ea', 14, 200);
            engine.addFloatingText(r.x, r.y - r.radius, 'ARMOR CRACKED!', '#dfe4ea', 13);
          }

          r.hitScale = isCrit ? 1.22 : 1.15;
          r.hitFlash = 0.22;
          if (r.vy > -120) r.vy -= 12;

          this.bus.emit('sfx:hit', { hpRatio: r.hp / r.maxHp, armored: hasIntactArmor });
          engine.addParticles(b.x, b.y, isCrit ? '#ff4757' : hasIntactArmor ? '#dfe4ea' : '#fffa65', isCrit ? 6 : 3, 110);

          if (r.hp <= 0) {
            this.destroyRock(r, j, engine, false);
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
          break;
        }
      }

      if (hit) {
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
      const spreadVx = (rock.variant === 'fast' ? 125 : 85) + Math.random() * 35;
      const popVy = -260 - Math.random() * 50;
      const childVariant =
        rock.variant === 'boss' || rock.variant === 'milestoneBoss' ? 'normal' : rock.variant;

      rocks.push(
        createRock({
          x: rock.x - 12,
          y: rock.y,
          vx: -spreadVx,
          vy: popVy,
          size: childSize,
          hp: childHp,
          isBoss: false,
          variant: childVariant,
          fromSplit: true,
        }),
        createRock({
          x: rock.x + 12,
          y: rock.y,
          vx: spreadVx,
          vy: popVy,
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

    if (rocks.length === 0 && waveSystem.waveRocksToSpawn.length === 0 && engine.gameState === 'PLAYING') {
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
