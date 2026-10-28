import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WaveSystem,
  calculateWaveTotalHP,
  getWaveBaseHP,
  getExpectedWaveDPS,
} from '../src/systems/WaveSystem.js';
import { EventBus } from '../src/core/EventBus.js';

test('WaveSystem - calculateWaveTotalHP includes child splits for medium and large rocks', () => {
  // Size 1 (no split): HP = 10 -> Total = 10
  assert.equal(calculateWaveTotalHP([{ size: 1, hp: 10 }]), 10);

  // Size 2 (splits into two size-1 rocks of 5 HP): 10 + 2*5 = 20
  assert.equal(calculateWaveTotalHP([{ size: 2, hp: 10 }]), 20);

  // Size 3 (splits into two size-2 of 10 HP, then four size-1 of 5 HP): 20 + 2*10 + 4*5 = 60
  assert.equal(calculateWaveTotalHP([{ size: 3, hp: 20 }]), 60);
});

test('WaveSystem - schedules standard boss every 3 waves and milestone boss every 10 waves', () => {
  const bus = new EventBus();
  const waveSystem = new WaveSystem(bus);

  waveSystem.setupWave(3, false);
  const wave3Last = waveSystem.waveRocksToSpawn[waveSystem.waveRocksToSpawn.length - 1];
  assert.equal(wave3Last.isBoss, true);
  assert.equal(wave3Last.isMilestone, false);
  assert.equal(wave3Last.variant, 'boss');

  let milestoneAlertFired = false;
  bus.on('wave:milestoneAlert', () => {
    milestoneAlertFired = true;
  });

  waveSystem.setupWave(10, true);
  const wave10Last = waveSystem.waveRocksToSpawn[waveSystem.waveRocksToSpawn.length - 1];
  assert.equal(wave10Last.isBoss, true);
  assert.equal(wave10Last.isMilestone, true);
  assert.equal(wave10Last.variant, 'milestoneBoss');
  assert.equal(milestoneAlertFired, true);
});

test('WaveSystem - Boss Rush mode spawns all boss boulders', () => {
  const bus = new EventBus();
  const waveSystem = new WaveSystem(bus);

  waveSystem.setupWave(4, false, Math.random, true);
  assert.ok(waveSystem.waveRocksToSpawn.length >= 2);
  assert.ok(waveSystem.waveRocksToSpawn.every((r) => r.isBoss === true));
});

test('WaveSystem - Viewport-aware boulder limits throttle incoming boulders when viewport is full', () => {
  const bus = new EventBus();
  const waveSystem = new WaveSystem(bus);
  const viewportWidth = 400;

  // Set up wave 70
  waveSystem.setupWave(70, false, Math.random, false, { viewportWidth });
  assert.ok(waveSystem.waveRocksToSpawn.length > 0);

  const activeRocks = [];
  // Initially screen is empty -> can spawn
  assert.equal(waveSystem.canSpawnInViewport(activeRocks, viewportWidth), true);

  // Spawn 1st rock (e.g. radius 54, diameter 108)
  const rock1 = { size: 3, radius: 54, x: 200, y: 300, hp: 1000 };
  activeRocks.push(rock1);
  assert.equal(waveSystem.canSpawnInViewport(activeRocks, viewportWidth), true);

  // Spawn 2nd rock (radius 38, diameter 76) -> total diameter = 184
  const rock2 = { size: 2, radius: 38, x: 100, y: 300, hp: 500 };
  activeRocks.push(rock2);

  // Try adding a 3rd rock (radius 38, diameter 76) -> total diameter = 260px > 208px (52% of 400)
  const rock3 = { size: 2, radius: 38, x: 300, y: 300, hp: 500 };
  activeRocks.push(rock3);

  // Now viewport footprint is saturated! canSpawnInViewport should be false
  assert.equal(waveSystem.canSpawnInViewport(activeRocks, viewportWidth), false);

  // Warning indicator must NOT show when viewport cannot accommodate incoming boulder
  waveSystem.spawnTimer = 0.1; // urgency window
  const warning = waveSystem.getPendingWarning(activeRocks, 70, viewportWidth);
  assert.equal(warning, null);

  // Update should NOT spawn new incoming boulders while viewport is saturated
  const queueLengthBefore = waveSystem.waveRocksToSpawn.length;
  waveSystem.update(0.5, 70, activeRocks, viewportWidth);
  assert.equal(waveSystem.waveRocksToSpawn.length, queueLengthBefore);

  // When player destroys a rock and frees up viewport space, incoming spawns resume
  activeRocks.pop(); // remove rock3
  activeRocks.pop(); // remove rock2 (only rock1 remains, footprint = 108px)
  assert.equal(waveSystem.canSpawnInViewport(activeRocks, viewportWidth), true);
});

test('WaveSystem - Wave 70 boulder health scales sustainably and is doable by existing firepower', () => {
  // Baseline HP at Wave 70 is calibrated (does not explode into 100k+ HP)
  const baseHp70 = getWaveBaseHP(70);
  assert.ok(baseHp70 >= 2000 && baseHp70 <= 4000, `baseHp70=${baseHp70} should be between 2000 and 4000`);

  // Expected DPS at Wave 70 is around ~20,000
  const expectedDPS = getExpectedWaveDPS(70);
  assert.ok(expectedDPS >= 15000 && expectedDPS <= 25000);

  // Case 1: Normal player with level 70 firepower (e.g. DPS = 22,000)
  // Boulders are calibrated so standard rock takes ~1-3s of sustained fire
  const playerDPS = 22000;
  const tunedBaseHP = getWaveBaseHP(70, playerDPS);
  assert.ok(tunedBaseHP <= baseHp70);
  // Largest normal rock (size 3) total HP including splits
  const rockTotalHP = tunedBaseHP * 2.2 * 3;
  const timeToKill = rockTotalHP / playerDPS;
  assert.ok(timeToKill < 3.0, `Time to kill (${timeToKill.toFixed(2)}s) should be comfortably doable`);

  // Case 2: Player with very little firepower (e.g. DPS = 400)
  // The system enforces a difficulty floor: you CANNOT finish all levels with very little firepower
  const weakDPS = 400;
  const weakBaseHP = getWaveBaseHP(70, weakDPS);
  // Must respect floor (at least 55% of base floor), preventing trivialization
  assert.ok(weakBaseHP >= baseHp70 * 0.5);
  const weakTimeToKill = (weakBaseHP * 2.2 * 3) / weakDPS;
  assert.ok(weakTimeToKill > 20.0, `Player with very little firepower should find wave 70 very hard (${weakTimeToKill.toFixed(1)}s per rock)`);
});

test('GameEngine integration - Wave 70 setupCurrentWave passes player firepower and viewport options', async () => {
  const { GameEngine } = await import('../src/core/GameEngine.js');
  const { SaveManager } = await import('../src/state/SaveManager.js');
  const { AchievementTracker } = await import('../src/state/AchievementTracker.js');

  class MemoryStorage {
    constructor() { this.map = new Map(); }
    getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
    setItem(k, v) { this.map.set(k, String(v)); }
  }

  const bus = new EventBus();
  const saveManager = new SaveManager(new MemoryStorage());
  const tracker = new AchievementTracker(saveManager, bus);
  const engine = new GameEngine({ bus, saveManager, achievementTracker: tracker });

  // Simulate player at wave 70 with upgrades
  saveManager.state.wave = 70;
  saveManager.state.upgrades.firePower = 30;
  saveManager.state.upgrades.fireRate = 25;

  engine.setupCurrentWave();

  assert.ok(engine.waveSystem.waveRocksToSpawn.length > 0);
  assert.ok(engine.waveSystem.waveRocksToSpawn.length <= 8, 'Wave 70 should not spawn an overwhelming queue');
  const milestoneBoss = engine.waveSystem.waveRocksToSpawn[engine.waveSystem.waveRocksToSpawn.length - 1];
  assert.equal(milestoneBoss.isBoss, true);
  assert.equal(milestoneBoss.isMilestone, true);
  assert.ok(milestoneBoss.hp < 25000, `Milestone boss HP (${milestoneBoss.hp}) should be doable, not 470k+`);
});
