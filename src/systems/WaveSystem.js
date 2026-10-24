/**
 * WaveSystem - Generates wave rock queues, calculates total wave HP (including child splits),
 * and schedules rock spawns.
 */

import { ROCK_RADII } from '../config/constants.js';
import { createRock } from '../entities/Rock.js';

export function pickRockVariant(waveNum, isBoss, isMilestone, rng = Math.random) {
  if (isMilestone) return 'milestoneBoss';
  if (isBoss) return 'boss';
  const roll = rng();
  if (waveNum >= 4 && roll < 0.16) return 'healer';
  if (waveNum >= 3 && roll < 0.34) return 'fast';
  if (waveNum >= 2 && roll < 0.52) return 'armored';
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

export class WaveSystem {
  constructor(bus) {
    this.bus = bus;
    this.waveRocksToSpawn = [];
    this.waveTotalHP = 100;
    this.waveDamageDealt = 0;
    this.spawnTimer = 0.4;
  }

  setupWave(waveNum, isPlaying = false, rng = Math.random) {
    this.waveRocksToSpawn = [];
    this.waveDamageDealt = 0;

    const isMilestoneWave = waveNum % 10 === 0;
    const isBossWave = waveNum % 3 === 0 || isMilestoneWave;

    const baseHP = Math.max(2, Math.round(4 * Math.pow(1.33, waveNum - 1)));
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
      let sizeMult = size === 3 ? 2.2 : size === 2 ? 1.2 : 0.6;
      if (variant === 'milestoneBoss') sizeMult = 4.2;
      else if (variant === 'boss') sizeMult = 2.8;
      else if (variant === 'fast') sizeMult *= 0.78;

      const hp = Math.max(1, Math.round(baseHP * sizeMult * (0.85 + rng() * 0.3)));

      this.waveRocksToSpawn.push({
        size,
        hp,
        isBoss,
        isMilestone: variant === 'milestoneBoss',
        variant,
      });
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
    const maxSimultaneous = 3 + Math.min(3, Math.floor(waveNum / 3));
    if (this.spawnTimer <= 0 && activeRocks.length < maxSimultaneous) {
      this.spawnNextRock(activeRocks, width);
      this.spawnTimer = Math.max(1.2, 2.8 - waveNum * 0.08);
    }
  }

  spawnNextRock(activeRocks, width) {
    if (this.waveRocksToSpawn.length === 0) return null;
    const spec = this.waveRocksToSpawn.shift();
    const fromLeft = Math.random() < 0.5;
    const radius = ROCK_RADII[spec.size] || 38;
    const x = fromLeft ? -radius * 0.5 : width + radius * 0.5;
    const y = 90 + Math.random() * 85;
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
