import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveManager, migrateSaveData } from '../src/state/SaveManager.js';
import { AchievementTracker } from '../src/state/AchievementTracker.js';
import { EventBus } from '../src/core/EventBus.js';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(k) {
    return this.map.has(k) ? this.map.get(k) : null;
  }
  setItem(k, v) {
    this.map.set(k, String(v));
  }
}

test('SaveManager - migrates legacy v1 save data cleanly without losing progress', () => {
  const legacySave = {
    coins: 450,
    bestScore: 1200,
    wave: 7,
    upgrades: { fireRate: 4, firePower: 3 },
  };
  const migrated = migrateSaveData(legacySave, 1000);
  assert.equal(migrated.coins, 450);
  assert.equal(migrated.bestScore, 1200);
  assert.equal(migrated.wave, 7);
  assert.equal(migrated.stats.highestWave, 7);
  assert.equal(migrated.upgrades.fireRate, 4);
  assert.equal(migrated.upgrades.coinValue, 1);
  assert.equal(migrated.equipped.skin, 'classic');
});

test('SaveManager & AchievementTracker - unlocks achievements and awards coins', () => {
  const storage = new MemoryStorage();
  const bus = new EventBus();
  const saveManager = new SaveManager(storage);
  const tracker = new AchievementTracker(saveManager, bus);

  const unlockedEvents = [];
  bus.on('achievement:unlocked', (ach) => unlockedEvents.push(ach.id));

  saveManager.state.stats.rocksDestroyed = 30;
  saveManager.state.stats.highestWave = 5;

  const unlocked = tracker.checkUnlockables();
  assert.equal(unlocked.length, 2);
  assert.ok(unlockedEvents.includes('rocks_25'));
  assert.ok(unlockedEvents.includes('wave_5'));
  assert.equal(saveManager.state.coins, 150); // 50 + 100 reward
});
