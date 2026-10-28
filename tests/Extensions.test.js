import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/core/GameEngine.js';
import { EventBus } from '../src/core/EventBus.js';
import { SaveManager } from '../src/state/SaveManager.js';
import { AchievementTracker } from '../src/state/AchievementTracker.js';
import { createRock } from '../src/entities/Rock.js';
import { calculatePrestigeReward, PRESTIGE_MIN_WAVE, TECH_TREE_NODES } from '../src/config/techTree.js';
import { getActiveSynergies } from '../src/config/synergies.js';
import { CANNON_VARIETIES } from '../src/config/cannons.js';

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

function createTestEngine() {
  const bus = new EventBus();
  const saveManager = new SaveManager(new MemoryStorage());
  const tracker = new AchievementTracker(saveManager, bus);
  const engine = new GameEngine({ bus, saveManager, achievementTracker: tracker });
  return { engine, bus, saveManager };
}

test('Prestige Math - requires minimum wave 25 and scales with higher waves', () => {
  assert.equal(calculatePrestigeReward(1), 0);
  assert.equal(calculatePrestigeReward(24), 0);
  assert.equal(calculatePrestigeReward(PRESTIGE_MIN_WAVE), 1);
  assert.ok(calculatePrestigeReward(30) >= 2);
  assert.ok(calculatePrestigeReward(50) >= 10);
  assert.ok(calculatePrestigeReward(70) >= 20);
});

test('SaveManager - prestige resets upgrades and wave, while depositing crystals', () => {
  const { saveManager } = createTestEngine();
  saveManager.state.wave = 30;
  saveManager.state.upgrades.fireRate = 12;
  saveManager.state.upgrades.firePower = 15;
  saveManager.state.coins = 50000;

  const harvested = saveManager.prestige();
  assert.ok(harvested > 0);
  assert.equal(saveManager.state.crystals, harvested);
  assert.equal(saveManager.state.wave, 1);
  assert.equal(saveManager.state.upgrades.fireRate, 1);
  assert.equal(saveManager.state.upgrades.firePower, 1);
  assert.equal(saveManager.state.prestigeCount, 1);
});

test('Tech Tree - unlocks perks and enforces crystal balances', () => {
  const { saveManager } = createTestEngine();
  saveManager.state.crystals = 3;

  assert.equal(saveManager.hasTechPerk('critShockwave'), false);
  const success = saveManager.unlockTechNode('critShockwave'); // cost: 2
  assert.equal(success, true);
  assert.equal(saveManager.state.crystals, 1);
  assert.equal(saveManager.hasTechPerk('critShockwave'), true);

  // Attempting to buy node costing 3 with 1 crystal should fail
  const fail = saveManager.unlockTechNode('quantumCapacitors'); // cost: 3
  assert.equal(fail, false);
  assert.equal(saveManager.hasTechPerk('quantumCapacitors'), false);
});

test('Overclock Synergies - detects synergies when dual required power-ups are active', () => {
  const activePowerups = {
    rapidFire: 0,
    spreadShot: 0,
    explosiveRounds: 0,
    piercingLaser: 0,
    giantBullets: 0,
    shield: 0,
    magnet: 0,
    freeze: 0,
  };

  assert.deepEqual(getActiveSynergies(activePowerups), []);

  // Activate rapidFire + piercingLaser => particleBeam
  activePowerups.rapidFire = 5.0;
  activePowerups.piercingLaser = 5.0;
  const syns1 = getActiveSynergies(activePowerups);
  assert.equal(syns1.length, 1);
  assert.equal(syns1[0].id, 'particleBeam');

  // Also activate freeze + explosiveRounds => shatterfrost
  activePowerups.freeze = 4.0;
  activePowerups.explosiveRounds = 4.0;
  const syns2 = getActiveSynergies(activePowerups);
  assert.equal(syns2.length, 2);
  assert.ok(syns2.some((s) => s.id === 'shatterfrost'));
});

test('Cannon Active Tactical Abilities - triggers ability and handles cooldown', () => {
  const { engine } = createTestEngine();
  engine.gameState = 'PLAYING';
  engine.setViewport(400, 700);

  const activeCannon = engine.saveManager.getActiveCannon();
  assert.ok(activeCannon.ability);
  assert.ok(activeCannon.ability.id);
  assert.ok(activeCannon.ability.cooldown > 0);

  // Trigger ability
  const triggered = engine.triggerCannonAbility();
  assert.equal(triggered, true);
  assert.ok(engine.cannon.abilityCooldown > 0);

  // Immediate retrigger should fail while on cooldown
  const retrigger = engine.triggerCannonAbility();
  assert.equal(retrigger, false);
});

test('Milestone Boss - reaches <= 50% HP and enters Enraged Phase 2', () => {
  const { engine } = createTestEngine();
  engine.gameState = 'PLAYING';
  engine.setViewport(400, 700);

  const boss = createRock({
    x: 200,
    y: 100,
    vx: 50,
    vy: 0,
    size: 3,
    hp: 1000,
    isMilestone: true,
  });
  engine.rocks.push(boss);

  // Deal damage down to 600 HP (60% HP) -> still Phase 1
  engine.combatSystem.applyDamageToRock(boss, 400, engine);
  assert.equal(boss.isPhaseTwo, false);

  // Deal damage down to 400 HP (40% HP) -> triggers Enraged Phase 2
  engine.combatSystem.applyDamageToRock(boss, 200, engine);
  assert.equal(boss.isPhaseTwo, true);
  assert.ok(Math.abs(boss.vx) > 50); // Speed boosted
});

test('Endless Survival Mode - unlocks at Wave 10, toggles mode, and tracks time', () => {
  const { engine } = createTestEngine();
  assert.equal(engine.isEndlessUnlocked(), false);

  // Reach wave 10
  engine.saveManager.state.stats.highestWave = 10;
  assert.equal(engine.isEndlessUnlocked(), true);

  // Cycle mode: STANDARD -> BOSS_RUSH -> ENDLESS
  engine.toggleGameMode();
  assert.equal(engine.gameMode, 'BOSS_RUSH');
  engine.toggleGameMode();
  assert.equal(engine.gameMode, 'ENDLESS');

  engine.startRun();
  assert.equal(engine.gameState, 'PLAYING');
  assert.equal(engine.endlessElapsed, 0);

  // Update engine with dt = 1.5s
  const dummyInput = { getKeyMoveDirection: () => 0, isFiring: () => false };
  engine.update(1.5, dummyInput);
  assert.ok(engine.endlessElapsed >= 1.49);
});

test('Binary Tethered Boulders - spawns paired rocks sharing tetherId and severs cleanly on destruction', () => {
  const { engine } = createTestEngine();
  engine.gameState = 'PLAYING';
  engine.setViewport(400, 700);

  const r1 = createRock({ x: 100, y: 150, vx: 30, vy: 0, size: 2, hp: 50 });
  const r2 = createRock({ x: 250, y: 150, vx: -30, vy: 0, size: 2, hp: 50 });
  const tetherId = 'tether_test_1';
  r1.tetherId = tetherId;
  r2.tetherId = tetherId;
  engine.rocks.push(r1, r2);

  // Kill r1
  engine.combatSystem.applyDamageToRock(r1, 100, engine);

  // Tether should be severed on r2
  assert.equal(r2.tetherId, null);
});
