/**
 * WaveSystem - Generates wave rock queues, calculates total wave HP (including child splits),
 * and schedules rock spawns for both Standard and Boss Rush modes.
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

export function getWaveBaseHP(waveNum) {
  // Smooth piecewise exponential curve so Wave 25-50+ doesn't outscale player DPS
  if (waveNum <= 12) {
    return Math.max(2, Math.round(4 * Math.pow(1.3, waveNum - 1)));
  }
  const hpAt12 = 4 * Math.pow(1.3, 11);
  if (waveNum <= 25) {
    return Math.round(hpAt12 * Math.pow(1.19, waveNum - 12));
  }
  const hpAt25 = hpAt12 * Math.pow(1.19, 13);
  return Math.round(hpAt25 * Math.pow(1.12, waveNum - 25));
}

export class WaveSystem {
  constructor(bus) {
    this.bus = bus;
    this.waveRocksToSpawn = [];
    this.waveTotalHP = 100;
    this.waveDamageDealt = 0;
    this.spawnTimer = 0.4;
  }

  setupWave(waveNum, isPlaying = false, rng = Math.random, isBossRush = false) {
    this.waveRocksToSpawn = [];
    this.waveDamageDealt = 0;

    const isMilestoneWave = waveNum % 10 === 0 || (isBossRush && waveNum % 3 === 0);
    const isBossWave = isBossRush || waveNum % 3 === 0 || isMilestoneWave;

    const baseHP = getWaveBaseHP(waveNum);

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
      const rockCount = isMilestoneWave
        ? 3 + Math.min(4, Math.floor(waveNum * 0.4))
        : 4 + Math.min(8, Math.floor(waveNum * 0.85));

      for (let i = 0; i < rockCount; i++) {
        const isFinalRock = i === rockCount - 1;
        const isBoss = isFinalRock && isBossWave;
        let size = 2;

        if (isBoss) {
          size = 3;
        } else if (isFinalRock && waveNum >= 2) {
          size = 3;
        } else if (rng() < 0.35) {
          size = 1;
        } else if (waveNum >= 3 && rng() < 0.3) {
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

    this.spawnTimer -= dt;
    // Weight active rocks by size so a screen full of splitting boulders doesn't get flooded
    const activeWeight = activeRocks.reduce(
      (sum, r) => sum + (r.size === 3 ? 2.0 : r.size === 2 ? 1.35 : 0.85),
      0
    );
    const maxWeight = 4.2 + Math.min(2.5, Math.floor(waveNum / 6) * 0.5);

    if (this.spawnTimer <= 0 && (activeRocks.length === 0 || activeWeight < maxWeight)) {
      this.spawnNextRock(activeRocks, width);
      // Stagger spawns further apart when multiple rocks are already active on screen
      const crowdDelay = activeRocks.length * 0.55;
      this.spawnTimer = Math.max(1.8, 2.5 - Math.min(0.8, waveNum * 0.03) + crowdDelay);
    }
  }

  getPendingWarning(activeRocks, waveNum) {
    if (this.waveRocksToSpawn.length === 0 || this.spawnTimer > 0.65) return null;
    const activeWeight = activeRocks.reduce(
      (sum, r) => sum + (r.size === 3 ? 2.0 : r.size === 2 ? 1.35 : 0.85),
      0
    );
    const maxWeight = 4.2 + Math.min(2.5, Math.floor(waveNum / 6) * 0.5);
    if (activeRocks.length > 0 && activeWeight >= maxWeight) return null;
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
    const x = fromLeft ? -radius * 0.5 : width + radius * 0.5;
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
