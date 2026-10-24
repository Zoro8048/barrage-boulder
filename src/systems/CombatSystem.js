/**
 * CombatSystem - Handles volley firing, bullet-to-rock collisions, armor cracking,
 * rock splitting, boss abilities, and healer pulses.
 */

import { PHYSICS } from '../config/constants.js';
import { ROCK_VARIANTS, getRockColorTier } from '../config/rockVariants.js';
import { createRock } from '../entities/Rock.js';
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
        })
      );
    }

    cannon.recoil = 6;
    cannon.muzzleFlash = 1;
    this.bus.emit('sfx:shoot', { overdrive: isOverdrive });
  }

  updateBullets(dt, engine) {
    const { bullets, bulletPool, rocks, width, saveManager, waveSystem } = engine;
    const save = saveManager.state;
    const bulletDmg = engine.getBulletDamage();

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.y < -30 || b.x < -20 || b.x > width + 20) {
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

          // Check Titan Boss temporary Aegis shield
          if (r.bossShieldTimer > 0) {
            this.bus.emit('sfx:hit', { hpRatio: 1, armored: true });
            engine.addParticles(b.x, b.y, '#48dbfb', 4, 110);
            break;
          }

          // Armored Rock takes reduced damage while armor is intact
          const hasIntactArmor = r.variant === 'armored' && !r.armorBroken;
          const armorScale = ROCK_VARIANTS.armored.armorDamageScale;
          const rawDmg = hasIntactArmor ? Math.max(1, Math.round(bulletDmg * armorScale)) : bulletDmg;
          const actualDmg = Math.min(r.hp, rawDmg);

          r.hp -= actualDmg;
          engine.score += actualDmg;
          waveSystem.waveDamageDealt += actualDmg;
          if (engine.score > save.bestScore) {
            save.bestScore = engine.score;
          }

          if (hasIntactArmor && r.hp <= r.maxHp * ROCK_VARIANTS.armored.armorBreakThreshold && r.hp > 0) {
            r.armorBroken = true;
            engine.addParticles(r.x, r.y, '#dfe4ea', 14, 200);
            engine.addFloatingText(r.x, r.y - r.radius, 'ARMOR CRACKED!', '#dfe4ea', 13);
          }

          r.hitScale = 1.15;
          r.hitFlash = 0.22;
          if (r.vy > -120) r.vy -= 12;

          this.bus.emit('sfx:hit', { hpRatio: r.hp / r.maxHp, armored: hasIntactArmor });
          engine.addParticles(b.x, b.y, hasIntactArmor ? '#dfe4ea' : '#fffa65', 3, 95);

          if (r.hp <= 0) {
            this.destroyRock(r, j, engine);
          }

          this.bus.emit('hud:scoreUpdated');
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

  destroyRock(rock, index, engine) {
    const { rocks, saveManager, waveSystem, achievementTracker } = engine;
    const save = saveManager.state;
    const col = getRockColorTier(rock.maxHp);

    engine.addParticles(rock.x, rock.y, col.fill, rock.size * 8, 220);
    this.bus.emit('rock:destroyed', { size: rock.size, isBoss: rock.isBoss });
    engine.triggerShake(rock.size * 3.5, 0.16);

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
