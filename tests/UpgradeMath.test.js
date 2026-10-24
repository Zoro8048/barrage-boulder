import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getUpgradeCost,
  getFireRateShotsPerSec,
  getBarrelCount,
  getDroneCount,
  getComboMultiplier,
  getBulletDamage,
  getCoinMultiplier,
  calculateOfflineEarnings,
} from '../src/state/UpgradeMath.js';

test('UpgradeMath - getUpgradeCost scales exponentially', () => {
  assert.equal(getUpgradeCost('fireRate', 1), 10);
  assert.equal(getUpgradeCost('firePower', 1), 10);
  assert.equal(getUpgradeCost('coinValue', 1), 15);
  assert.equal(getUpgradeCost('offlineEarnings', 1), 15);
  assert.ok(getUpgradeCost('fireRate', 5) > getUpgradeCost('fireRate', 4));
});

test('UpgradeMath - getBarrelCount unlocks at levels 4, 9, and 15', () => {
  assert.equal(getBarrelCount(1), 1);
  assert.equal(getBarrelCount(3), 1);
  assert.equal(getBarrelCount(4), 2);
  assert.equal(getBarrelCount(8), 2);
  assert.equal(getBarrelCount(9), 3);
  assert.equal(getBarrelCount(14), 3);
  assert.equal(getBarrelCount(15), 4);
  assert.equal(getBarrelCount(25), 4);
});

test('UpgradeMath - Overdrive and Magnet multipliers apply accurately', () => {
  const baseRate = getFireRateShotsPerSec(1, false);
  const overdriveRate = getFireRateShotsPerSec(1, true);
  assert.equal(baseRate, 8);
  assert.ok(Math.abs(overdriveRate - 8 * 1.85) < 0.001);

  const baseCoin = getCoinMultiplier(1, false);
  const magnetCoin = getCoinMultiplier(1, true);
  assert.equal(baseCoin, 1);
  assert.equal(magnetCoin, 1.5);
});

test('UpgradeMath - getBulletDamage increases monotonically', () => {
  assert.equal(getBulletDamage(1), 1);
  assert.ok(getBulletDamage(5) > getBulletDamage(2));
  assert.ok(getBulletDamage(10) > getBulletDamage(5));
});

test('UpgradeMath - calculateOfflineEarnings respects 60s minimum and 8h cap', () => {
  assert.equal(calculateOfflineEarnings(30, 1), 0);
  assert.equal(calculateOfflineEarnings(60, 1), 6);
  // 10 hours away should cap at 480 minutes (8 hours)
  assert.equal(calculateOfflineEarnings(600 * 60, 1), 480 * 6);
});

test('UpgradeMath - getDroneCount unlocks 1 drone at Wave 5/FP 5 and 2 drones at Wave 12/FP 10', () => {
  assert.equal(getDroneCount(1, 1), 0);
  assert.equal(getDroneCount(5, 1), 1);
  assert.equal(getDroneCount(2, 5), 1);
  assert.equal(getDroneCount(12, 1), 2);
  assert.equal(getDroneCount(4, 10), 2);
});

test('UpgradeMath - getComboMultiplier scales at 5, 10, 25, and 50 hit streaks', () => {
  assert.equal(getComboMultiplier(0), 1.0);
  assert.equal(getComboMultiplier(5), 1.2);
  assert.equal(getComboMultiplier(10), 1.5);
  assert.equal(getComboMultiplier(25), 2.0);
  assert.equal(getComboMultiplier(50), 2.5);
});
