import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/core/GameEngine.js';
import { EventBus } from '../src/core/EventBus.js';
import { SaveManager } from '../src/state/SaveManager.js';
import { AchievementTracker } from '../src/state/AchievementTracker.js';
import { createRock } from '../src/entities/Rock.js';
import { CombatSystem } from '../src/systems/CombatSystem.js';

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

test('Hull Shield - initializes to 3 and expands to 4 with offlineEarnings Lv.10', () => {
  const { engine, saveManager } = createTestEngine();
  engine.recalcMaxHull();
  assert.equal(engine.maxHull, 3);
  assert.equal(engine.hull, 3);

  saveManager.state.upgrades.offlineEarnings = 10;
  engine.recalcMaxHull();
  assert.equal(engine.maxHull, 4);
});

test('Hull Shield - takeHullDamage decrements hull and sets mercy invulnerability before dying', () => {
  const { engine, bus } = createTestEngine();
  engine.gameState = 'PLAYING';
  engine.recalcMaxHull();
  assert.equal(engine.hull, 3);

  const mockRock = createRock({ x: 200, y: 500, vx: 0, vy: 0, size: 1, hp: 10 });
  let hullUpdatedCalls = 0;
  bus.on('hull:updated', () => hullUpdatedCalls++);

  // Hit 1: 3 -> 2
  engine.takeHullDamage(mockRock);
  assert.equal(engine.hull, 2);
  assert.ok(engine.invulnerableTimer > 1.0);
  assert.equal(engine.gameState, 'PLAYING');

  // While invulnerable, another hit should not damage hull
  engine.takeHullDamage(mockRock);
  assert.equal(engine.hull, 2);

  // Clear invulnerability
  engine.invulnerableTimer = 0;

  // Hit 2: 2 -> 1
  engine.takeHullDamage(mockRock);
  assert.equal(engine.hull, 1);
  assert.equal(engine.gameState, 'PLAYING');

  // Clear invulnerability
  engine.invulnerableTimer = 0;

  // Hit 3 (hull == 1): Crushed! Game Over / Dying sequence
  engine.takeHullDamage(mockRock);
  assert.equal(engine.hull, 0);
  assert.equal(engine.gameState, 'DYING');
});

test('Tactical Augments - activates augments and applies Aegis Plating hull expansion', () => {
  const { engine, bus } = createTestEngine();
  let augmentEvent = null;
  bus.on('augment:updated', (augs) => {
    augmentEvent = augs;
  });

  engine.recalcMaxHull();
  assert.equal(engine.maxHull, 3);

  engine.activateAugment('chainVolt');
  assert.deepEqual(engine.activeAugments, ['chainVolt']);
  assert.deepEqual(augmentEvent, ['chainVolt']);

  engine.activateAugment('aegisPlating');
  assert.ok(engine.activeAugments.includes('aegisPlating'));
  assert.equal(engine.maxHull, 4);
  assert.equal(engine.hull, 4);
});

test('CombatSystem - Shatter Blast AoE and TNT explosions do not cause recursive stack overflow', () => {
  const { engine, bus, saveManager } = createTestEngine();
  const combat = new CombatSystem(bus);
  saveManager.state.upgrades.firePower = 20; // Shatter Blast active

  const r1 = createRock({ x: 100, y: 100, vx: 0, vy: 0, size: 1, hp: 5 });
  const r2 = createRock({ x: 110, y: 100, vx: 0, vy: 0, size: 1, hp: 5 });
  const tnt = createRock({ x: 120, y: 100, vx: 0, vy: 0, size: 1, hp: 5, variant: 'tntBarrel' });
  engine.rocks.push(r1, r2, tnt);

  assert.doesNotThrow(() => {
    combat.applyDamageToRock(r1, 15, engine);
  });
  assert.equal(engine.rocks.length, 0);
});

test('PhysicsSystem - keeps boulders strictly within viewport top (ceiling clamp and downward deflection)', () => {
  const { engine } = createTestEngine();
  // Create a rock moving fast upward near the top
  const rock = createRock({ x: 200, y: 10, vx: 0, vy: -500, size: 2, hp: 50 });
  engine.rocks.push(rock);

  // Update physics
  engine.physicsSystem.updateRocks(0.016, engine);

  // Rock must not have escaped past the top: y must be >= radius + 2, and vy must be reversed downward (> 0)
  assert.ok(rock.y >= rock.radius, `Rock y (${rock.y}) must stay inside the viewport (>= radius ${rock.radius})`);
  assert.ok(rock.vy > 0, `Rock vy (${rock.vy}) must deflect downwards`);
});

test('CombatSystem - does not juggle boulders out of viewport top when hit near ceiling', () => {
  const { engine, bus } = createTestEngine();
  const combat = new CombatSystem(bus);
  // Place rock near top of viewport
  const rock = createRock({ x: 200, y: 50, vx: 0, vy: -10, size: 2, hp: 500 });
  engine.rocks.push(rock);

  const bullet = {
    x: 200,
    y: 50,
    vx: 0,
    vy: -760,
    radius: 5,
    damageRatio: 1,
    isGiant: false,
    bouncesLeft: 0,
  };
  engine.bullets.push(bullet);

  const initialVy = rock.vy;
  combat.updateBullets(0.016, engine);

  // Bullet should not have decreased vy into higher negative upward velocity
  assert.ok(rock.vy >= initialVy, `rock.vy (${rock.vy}) should not decrease further into upward velocity when near top`);
});
