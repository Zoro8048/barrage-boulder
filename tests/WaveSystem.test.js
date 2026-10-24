import test from 'node:test';
import assert from 'node:assert/strict';
import { WaveSystem, calculateWaveTotalHP } from '../src/systems/WaveSystem.js';
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
