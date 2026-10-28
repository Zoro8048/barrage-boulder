/**
 * WaveSystem - Generates wave rock queues, calculates total wave HP (including child splits),
 * calibrates boulder health and sizes based on player firepower and progression,
 * and schedules viewport-aware rock spawns for both Standard and Boss Rush modes.
 */

import { ROCK_RADII } from '../config/constants.js';
import { createRock } from '../entities/Rock.js';

export function pickRockVariant(waveNum, isBoss, isMilestone, rng = Math.random) {
  if (isMilestone) return 'milestoneBoss';
  if (isBoss) return 'boss';
  const roll = rng();
  if (waveNum >= 2 && roll < 0.09) return 'tntBarrel';
  if (waveNum >= 2 && roll < 0.17) return 'goldGeode';
  if (waveNum >= 4 && roll < 0.28) return 'healer';
  if (waveNum >= 3 && roll < 0.44) return 'fast';
  if (waveNum >= 2 && roll < 0.60) return 'armored';
  return 'normal';
}

export function calculateWaveTotalHP(rockQueue) {
  return rockQueue.reduce((acc, r) => {
    if (r.size === 3) {
      const half = Math.max(1, Math.floor(r.hp * 0.5));
      const quarter = Math.max(1, Math.floor(half * 0.5));
      return acc + r.hp + 2 * half + 4 * quarter;
    }
    if (r.size === 2) {
      const half = Math.max(1, Math.floor(r.hp * 0.5));
      return acc + r.hp + 2 * half;
    }
    return acc + r.hp;
  }, 0);
}

/**
 * Expected baseline DPS of a player at waveNum under normal progression.
 */
export function getExpectedWaveDPS(waveNum) {
  if (waveNum <= 10) return 50 + waveNum * 45;
  if (waveNum <= 25) return 500 + (waveNum - 10) * 350;
  if (waveNum <= 50) return 5750 + (waveNum - 25) * 370;
  return 15000 + (waveNum - 50) * 350;
}

export function getWaveBaseHP(waveNum, playerDPS = null) {
  // Smooth piecewise curve calibrated with upgrade economy so higher waves
  // (like Wave 50-70+) remain challenging without outscaling player DPS into an impossible wall.
  let baseHP;
  if (waveNum <= 12) {
    baseHP = Math.max(2, Math.round(4 * Math.pow(1.3, waveNum - 1)));
  } else if (waveNum <= 25) {
    const hpAt12 = 4 * Math.pow(1.3, 11);
    baseHP = Math.round(hpAt12 * Math.pow(1.19, waveNum - 12));
  } else if (waveNum <= 50) {
    const hpAt12 = 4 * Math.pow(1.3, 11);
    const hpAt25 = hpAt12 * Math.pow(1.19, 13);
    baseHP = Math.round(hpAt25 * Math.pow(1.042, waveNum - 25));
  } else {
    const hpAt12 = 4 * Math.pow(1.3, 11);
    const hpAt25 = hpAt12 * Math.pow(1.19, 13);
    const hpAt50 = hpAt25 * Math.pow(1.042, 25);
    baseHP = Math.round(hpAt50 * Math.pow(1.022, waveNum - 50));
  }

  // If existing player firepower (DPS) is provided, calibrate boulder HP so it is doable
  // with existing firepower, while enforcing a difficulty floor so players with very little
  // firepower cannot finish all the levels without upgrading.
  if (playerDPS && playerDPS > 0) {
    const expectedDPS = getExpectedWaveDPS(waveNum);
    const firepowerRatio = Math.max(0.1, playerDPS / expectedDPS);

    // Maximum base HP that is comfortably doable in ~2.5 - 3.5 seconds of sustained fire
    // for a large rock (size 3 total split multiplier is ~3 * 2.2 = 6.6)
    const maxDoableBaseHP = Math.round((playerDPS * 2.8) / (2.2 * 3));

    // High waves enforce a minimum difficulty floor proportional to the wave's expected firepower.
    // This prevents finishing all levels with very little firepower.
    const minWaveFloor = Math.round(baseHP * Math.min(1.0, Math.max(0.55, firepowerRatio)));

    baseHP = Math.max(minWaveFloor, Math.min(baseHP, maxDoableBaseHP));
  }

  return Math.max(2, baseHP);
}

export class WaveSystem {
  constructor(bus) {
    this.bus = bus;
    this.waveRocksToSpawn = [];
    this.waveTotalHP = 100;
    this.waveDamageDealt = 0;
    this.spawnTimer = 0.4;
    this.viewportWidth = 400;
  }

  getViewportLimits(width = 400) {
    const w = width || this.viewportWidth || 400;
    // Maximum combined horizontal footprint (sum of rock diameters)
    // leaving at least 48% clear corridor for the cannon (52px wide) to dodge safely
    const maxActiveFootprint = Math.max(160, Math.round(w * 0.52));
    // Maximum concurrent boulders that can cleanly fit in the viewport
    const maxActiveCount = Math.max(2, Math.min(5, Math.floor(w / 85)));
    return { maxActiveFootprint, maxActiveCount, width: w };
  }

  canSpawnInViewport(activeRocks, width = 400) {
    if (activeRocks.length === 0) return true;
    const { maxActiveFootprint, maxActiveCount, width: w } = this.getViewportLimits(width);
    if (activeRocks.length >= maxActiveCount) return false;

    const activeFootprint = activeRocks.reduce(
      (sum, r) => sum + (r.radius ? r.radius * 2 : (ROCK_RADII[r.size] || 38) * 2),
      0
    );
    if (activeFootprint >= maxActiveFootprint) return false;

    // If next rock would exceed comfortable corridor space, hold back
    if (this.waveRocksToSpawn.length > 0) {
      const nextSize = this.waveRocksToSpawn[0].size;
      const nextDiam = (ROCK_RADII[nextSize] || 38) * 2;
      if (activeFootprint + nextDiam > w * 0.72) return false;
    }

    return true;
  }

  setupWave(waveNum, isPlaying = false, rng = Math.random, isBossRush = false, options = {}) {
    this.waveRocksToSpawn = [];
    this.waveDamageDealt = 0;
    if (options.viewportWidth) this.viewportWidth = options.viewportWidth;

    const isMilestoneWave = waveNum % 10 === 0 || (isBossRush && waveNum % 3 === 0);
    const isBossWave = isBossRush || waveNum % 3 === 0 || isMilestoneWave;

    const playerDPS = options.playerDPS || null;
    const baseHP = getWaveBaseHP(waveNum, playerDPS);

    if (isBossRush) {
      // Boss Rush Mode: 2 to 3 high-intensity Boss & Escort boulders per wave
      const bossCount = 2 + (waveNum >= 5 ? 1 : 0);
      for (let i = 0; i < bossCount; i++) {
        const isFinal = i === bossCount - 1;
        const isMilestone = isFinal && isMilestoneWave;
        const variant = isMilestone ? 'milestoneBoss' : isFinal ? 'boss' : pickRockVariant(waveNum, true, false, rng);
        const size = isFinal ? 3 : 2;
        const sizeMult = isMilestone ? 3.8 : isFinal ? 2.6 : 1.6;
        const hp = Math.max(2, Math.round(baseHP * sizeMult));

        this.waveRocksToSpawn.push({
          size,
          hp,
          isBoss: true,
          isMilestone,
          variant,
          fromLeft: rng() < 0.5,
          spawnYRatio: rng(),
        });
      }
    } else {
      // Viewport-aware total rock count so waves do not flood the screen with endless splitting sponges
      const rockCount = isMilestoneWave
        ? 3 + Math.min(2, Math.floor(waveNum * 0.05))
        : 4 + Math.min(4, Math.floor(waveNum * 0.08));

      for (let i = 0; i < rockCount; i++) {
        const isFinalRock = i === rockCount - 1;
        const isBoss = isFinalRock && isBossWave;
        let size = 2;

        if (isBoss) {
          size = 3;
        } else if (isFinalRock && waveNum >= 2) {
          size = 3;
        } else if (rng() < 0.38) {
          size = 1;
        } else if (waveNum >= 3 && rng() < 0.28) {
          size = 3;
        }

        const variant = pickRockVariant(waveNum, isBoss, isBoss && isMilestoneWave, rng);
        if (variant === 'tntBarrel' || variant === 'goldGeode') {
          size = 1;
        }
        let sizeMult = size === 3 ? 2.2 : size === 2 ? 1.2 : 0.6;
        if (variant === 'milestoneBoss') sizeMult = 4.2;
        else if (variant === 'boss') sizeMult = 2.8;
        else if (variant === 'fast') sizeMult *= 0.78;
        else if (variant === 'tntBarrel') sizeMult = 0.75;
        else if (variant === 'goldGeode') sizeMult = 0.85;

        const hp = Math.max(1, Math.round(baseHP * sizeMult * (0.85 + rng() * 0.3)));

        this.waveRocksToSpawn.push({
          size,
          hp,
          isBoss,
          isMilestone: variant === 'milestoneBoss',
          variant,
          fromLeft: rng() < 0.5,
          spawnYRatio: rng(),
        });
      }
    }

    this.waveTotalHP = calculateWaveTotalHP(this.waveRocksToSpawn);
    this.spawnTimer = 0.4;

    if (this.bus) {
      this.bus.emit('wave:updated', {
        waveNum,
        damageDealt: this.waveDamageDealt,
        totalHP: this.waveTotalHP,
      });

      if (isPlaying && isMilestoneWave) {
        this.bus.emit('wave:milestoneAlert', { waveNum });
      }
    }
  }

  update(dt, waveNum, activeRocks, width) {
    if (this.waveRocksToSpawn.length === 0) return;
    if (width) this.viewportWidth = width;

    // Viewport-aware check: do not spawn new incoming boulders if the viewport is saturated
    const canSpawn = this.canSpawnInViewport(activeRocks, width);

    if (!canSpawn) {
      // Hold back incoming spawn and maintain a safe buffer so the player gets space to dodge and clear rocks
      this.spawnTimer = Math.max(this.spawnTimer, 0.75);
      return;
    }

    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0) {
      this.spawnNextRock(activeRocks, width || this.viewportWidth);

      // Stagger next incoming boulder based on current viewport occupancy
      const limits = this.getViewportLimits(width);
      const currentFootprint = activeRocks.reduce(
        (sum, r) => sum + (r.radius ? r.radius * 2 : (ROCK_RADII[r.size] || 38) * 2),
        0
      );
      const occupancyRatio = Math.min(1, currentFootprint / limits.maxActiveFootprint);
      const countRatio = Math.min(1, activeRocks.length / limits.maxActiveCount);
      const pressure = Math.max(occupancyRatio, countRatio);

      // Dynamic pacing: ~1.8s when clear, up to ~4.2s when crowded
      this.spawnTimer = 1.8 + pressure * 2.2;
    }
  }

  getPendingWarning(activeRocks, waveNum, width) {
    if (this.waveRocksToSpawn.length === 0 || this.spawnTimer > 0.65) return null;
    const effectiveWidth = width || this.viewportWidth || 400;
    if (!this.canSpawnInViewport(activeRocks, effectiveWidth)) return null;

    const next = this.waveRocksToSpawn[0];
    return {
      fromLeft: next.fromLeft ?? true,
      y: 95 + (next.spawnYRatio ?? 0.5) * 80,
      isBoss: next.isBoss,
      variant: next.variant,
      size: next.size,
      urgency: 1 - Math.max(0, this.spawnTimer) / 0.65,
    };
  }

  spawnNextRock(activeRocks, width) {
    if (this.waveRocksToSpawn.length === 0) return null;
    const spec = this.waveRocksToSpawn.shift();
    const fromLeft = spec.fromLeft !== undefined ? spec.fromLeft : Math.random() < 0.5;
    const radius = ROCK_RADII[spec.size] || 38;
    const effWidth = width || this.viewportWidth || 400;
    const x = fromLeft ? -radius * 0.5 : effWidth + radius * 0.5;
    const y = 95 + (spec.spawnYRatio !== undefined ? spec.spawnYRatio : Math.random()) * 80;
    const baseSpeed = spec.variant === 'fast' ? 140 + Math.random() * 65 : 75 + Math.random() * 55;
    const speedX = (fromLeft ? 1 : -1) * baseSpeed;

    if (spec.isBoss && this.bus) {
      this.bus.emit('boss:spawned', spec);
    }

    const rock = createRock({
      x,
      y,
      vx: speedX,
      vy: -40,
      size: spec.size,
      hp: spec.hp,
      isBoss: spec.isBoss,
      isMilestone: spec.isMilestone,
      variant: spec.variant,
      fromSplit: false,
    });

    activeRocks.push(rock);
    return rock;
  }
}
