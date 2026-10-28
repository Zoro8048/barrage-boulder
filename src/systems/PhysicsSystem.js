/**
 * PhysicsSystem - Updates positions, gravity, wall/ground bounces, and magnetic collection
 * for rocks, coins, power-up orbs, particles, shockwaves, and floating text.
 */

import { PHYSICS, ROCK_BOUNCE_VELOCITIES } from '../config/constants.js';
import { ROCK_VARIANTS } from '../config/rockVariants.js';

export class PhysicsSystem {
  constructor(bus) {
    this.bus = bus;
  }

  updateRocks(dt, engine) {
    const {
      rocks,
      cannon,
      width,
      groundY,
      gameState,
      invulnerableTimer,
      activePowerups,
      combatSystem,
      saveManager,
    } = engine;

    const addon = saveManager.getActiveAddon();
    const globalScale = activePowerups.freeze > 0 ? PHYSICS.CRYO_TIME_SCALE : 1;

    // Cryo Blizzard ambient falling snow particles
    if (activePowerups.freeze > 0 && Math.random() < 0.3) {
      engine.spawnParticle({
        x: Math.random() * width,
        y: 60 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 40,
        vy: 50 + Math.random() * 40,
        r: 2 + Math.random() * 2,
        color: '#7ed6df',
        life: 0.85,
        decay: 1.1,
      });
    }

    for (let i = rocks.length - 1; i >= 0; i--) {
      const r = rocks[i];
      if (r.chillTimer > 0) r.chillTimer = Math.max(0, r.chillTimer - dt);
      const rockScale = r.chillTimer > 0 ? Math.min(globalScale, 0.55) : globalScale;
      const rDt = dt * rockScale;

      r.vy += PHYSICS.GRAVITY * rDt;
      r.x += r.vx * rDt;
      r.y += r.vy * rDt;
      r.angle += r.vAngle * rDt;

      if (r.hitScale > 1) r.hitScale = Math.max(1, r.hitScale - dt * 1.8);
      if (r.hitFlash > 0) r.hitFlash = Math.max(0, r.hitFlash - dt * 2.5);
      if (r.bossShieldTimer > 0) r.bossShieldTimer = Math.max(0, r.bossShieldTimer - dt);

      if (r.abilityTimer > 0 && gameState === 'PLAYING') {
        r.abilityTimer -= rDt;
        if (r.abilityTimer <= 0) {
          combatSystem.triggerRockSpecialAbility(r, engine);
        }
      }

      // Fast meteor fiery trail
      if (r.variant === 'fast' && Math.random() < 0.35) {
        engine.spawnParticle({
          x: r.x + (Math.random() - 0.5) * r.radius * 0.6,
          y: r.y + (Math.random() - 0.5) * r.radius * 0.6,
          vx: -r.vx * 0.2,
          vy: -30,
          r: 2.2 + Math.random() * 2.5,
          color: '#ff6b6b',
          life: 0.6,
          decay: 2.2,
        });
      }

      // Wall bounce
      if (r.x - r.radius < 0 && r.vx < 0) {
        r.x = r.radius;
        r.vx = Math.abs(r.vx);
        r.vAngle = Math.abs(r.vAngle);
      } else if (r.x + r.radius > width && r.vx > 0) {
        r.x = width - r.radius;
        r.vx = -Math.abs(r.vx);
        r.vAngle = -Math.abs(r.vAngle);
      }

      // Ceiling bounce - keep boulders strictly within the viewport at the top
      const ceilingY = r.radius + 2;
      if (r.y < ceilingY) {
        r.y = ceilingY;
        if (r.vy < 0) {
          r.vy = Math.max(50, Math.abs(r.vy) * 0.45);
          r.hitScale = 1.08;
          engine.addParticles(r.x, r.radius, 'rgba(255, 255, 255, 0.3)', 3, 50);
        }
      }

      // Ground bounce (varied per rock + Sub-Zero Bumper add-on frost effect)
      if (r.y + r.radius >= groundY) {
        r.y = groundY - r.radius;
        const baseBounce = ROCK_BOUNCE_VELOCITIES[r.size] || -550;
        const varCfg = ROCK_VARIANTS[r.variant] || ROCK_VARIANTS.normal;
        const perRockMult = r.bounceFactor || 1.0;
        const liveJitter = 0.95 + Math.random() * 0.1;
        r.vy = baseBounce * (varCfg.bounceMultiplier || 1) * perRockMult * liveJitter;
        r.hitScale = 1.1;
        engine.addParticles(r.x, groundY, 'rgba(255,255,255,0.35)', 4, 70);

        // Sub-Zero Bumper Add-on: Floor bounce chills & damages rock
        if (gameState === 'PLAYING' && addon.id === 'cryoCore') {
          r.chillTimer = 1.6;
          const frostDmg = Math.max(1, Math.round(engine.getBulletDamage() * 1.8));
          combatSystem.applyDamageToRock(r, frostDmg, engine, { isCrit: false });
          if (!rocks.includes(r)) continue;
        }
      }

      // Cannon collision (with Force Shield & Bumper Buzzsaw Add-on support)
      if (gameState === 'PLAYING') {
        const cannonCenterY = cannon.y - 24;
        const distSq = (r.x - cannon.x) ** 2 + (r.y - cannonCenterY) ** 2;
        const hitDist = r.radius + cannon.radius - 7;
        if (distSq <= hitDist * hitDist) {
          if (invulnerableTimer > 0 || activePowerups.shield > 0) {
            r.vy = -520;
            r.y = Math.min(r.y, cannonCenterY - hitDist - 4);
            this.bus.emit('sfx:hit', { hpRatio: 0.2, armored: true });
            engine.triggerShake(6, 0.14);
            engine.addShockwave(cannon.x, cannonCenterY, 75, 'rgba(46, 213, 115, 0.85)');
            engine.addParticles(r.x, r.y + r.radius * 0.5, '#2ed573', 12, 190);
            if (activePowerups.shield > 0) {
              const zapDmg = Math.max(2, Math.round(engine.getBulletDamage() * 3.2));
              engine.addFloatingText(r.x, r.y - 14, `🛡️ DOME ZAP!`, '#2ed573', 13);
              combatSystem.applyDamageToRock(r, zapDmg, engine, { isCrit: true });
            }
          } else if (addon.id === 'sawBlade' && cannon.sawCooldown <= 0) {
            // Bumper Buzzsaw slices rock and bounces it skyward!
            cannon.sawCooldown = 2.5;
            r.vy = -540;
            r.y = Math.min(r.y, cannonCenterY - hitDist - 6);
            this.bus.emit('sfx:hit', { hpRatio: 0.1, armored: true });
            engine.triggerShake(8, 0.18);
            engine.addParticles(cannon.x, cannon.y - 36, '#ff9f1a', 14, 210);
            engine.addFloatingText(cannon.x, cannon.y - 54, '⚙️ SAW PARRY!', '#ff9f1a', 14);
            const sawDmg = Math.max(2, Math.round(engine.getBulletDamage() * 4.5));
            combatSystem.applyDamageToRock(r, sawDmg, engine, { isCrit: true });
          } else {
            engine.takeHullDamage(r);
            break;
          }
        }
      }
    }
  }

  updatePowerups(dt, engine) {
    const { powerups, cannon, width, groundY } = engine;
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.vy += PHYSICS.POWERUP_GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.bobPhase += dt * 6;
      p.life -= dt;

      if (p.x < p.radius) {
        p.x = p.radius;
        p.vx *= -0.7;
      } else if (p.x > width - p.radius) {
        p.x = width - p.radius;
        p.vx *= -0.7;
      }

      if (p.y + p.radius >= groundY) {
        p.y = groundY - p.radius;
        p.vy = -170;
        p.vx *= 0.85;
      }

      const dxC = cannon.x - p.x;
      const dyC = cannon.y - 22 - p.y;
      const dist = Math.hypot(dxC, dyC);
      if (dist < 130) {
        p.x += (dxC / (dist || 1)) * 320 * dt;
        p.y += (dyC / (dist || 1)) * 320 * dt;
      }

      if (dist < cannon.radius + p.radius + 8) {
        engine.activatePowerup(p.type, p.x, p.y);
        powerups.splice(i, 1);
      } else if (p.life <= 0) {
        powerups.splice(i, 1);
      }
    }
  }

  updateCoins(dt, engine) {
    const { coins, cannon, width, groundY, activePowerups, saveManager } = engine;
    const isMagnet = activePowerups.magnet > 0;
    const hasVortex = activePowerups.shield > 0 && isMagnet;
    const hasMagnetTech = saveManager.hasTechPerk && saveManager.hasTechPerk('magneticInduction');
    const baseRange = (PHYSICS.DEFAULT_MAGNET_RANGE || 115) * (hasMagnetTech ? 1.5 : 1.0);
    const magnetRange = hasVortex ? 1200 : isMagnet ? PHYSICS.BOOSTED_MAGNET_RANGE : baseRange;
    const magnetSpeed =
      (hasVortex ? 950 : isMagnet ? PHYSICS.BOOSTED_MAGNET_SPEED : PHYSICS.DEFAULT_MAGNET_SPEED) *
      (hasMagnetTech ? 1.25 : 1.0);

    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.vy += PHYSICS.COIN_GRAVITY * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.spin += dt * 9;
      c.life -= dt;

      if (c.x < c.radius) {
        c.x = c.radius;
        c.vx *= -0.6;
      } else if (c.x > width - c.radius) {
        c.x = width - c.radius;
        c.vx *= -0.6;
      }

      if (c.y + c.radius >= groundY) {
        c.y = groundY - c.radius;
        c.vy *= -0.45;
        c.vx *= 0.82;
        if (Math.abs(c.vy) < 25) c.vy = 0;
      }

      const dxC = cannon.x - c.x;
      const dyC = cannon.y - 20 - c.y;
      const dist = Math.hypot(dxC, dyC);
      if (dist < magnetRange) {
        const pull = (1 - Math.min(0.85, dist / magnetRange)) * magnetSpeed;
        c.x += (dxC / (dist || 1)) * pull * dt;
        c.y += (dyC / (dist || 1)) * pull * dt;
      }

      if (dist < cannon.radius + c.radius + 8 || c.life <= 0) {
        this.bus.emit('sfx:coin');
        engine.awardCoins(c.value, c.x, c.y - 10);
        coins.splice(i, 1);
      }
    }
  }

  updateVFX(dt, engine) {
    const { shockwaves, laserBeams, particles, floatingTexts, particlePool, textPool } = engine;

    if (laserBeams) {
      for (let i = laserBeams.length - 1; i >= 0; i--) {
        laserBeams[i].life -= dt * 6.5;
        if (laserBeams[i].life <= 0) laserBeams.splice(i, 1);
      }
    }

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * Math.min(1, dt * 8);
      sw.life -= dt * 2.2;
      if (sw.life <= 0) shockwaves.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += PHYSICS.PARTICLE_GRAVITY * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        particlePool.release(p);
      }
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt * 1.35;
      if (ft.life <= 0) {
        floatingTexts.splice(i, 1);
        textPool.release(ft);
      }
    }
  }
}
