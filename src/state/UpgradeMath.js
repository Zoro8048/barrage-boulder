/**
 * Pure Upgrade & Stat Calculation Functions
 */

import { UPGRADE_CONFIG } from '../config/upgrades.js';

export function getUpgradeCost(type, currentLevel = 1) {
  const cfg = UPGRADE_CONFIG[type];
  const base = cfg ? cfg.baseCost : 10;
  const exp = cfg ? cfg.costExponent : 1.42;
  return Math.floor(base * Math.pow(exp, Math.max(1, currentLevel) - 1));
}

export function getBaseFireRateShotsPerSec(fireRateLevel = 1) {
  const cfg = UPGRADE_CONFIG.fireRate;
  return cfg.baseShotsPerSec + (Math.max(1, fireRateLevel) - 1) * cfg.shotsPerLevel;
}

export function getFireRateShotsPerSec(fireRateLevel = 1, isOverdriveActive = false) {
  const base = getBaseFireRateShotsPerSec(fireRateLevel);
  return isOverdriveActive ? base * UPGRADE_CONFIG.fireRate.overdriveMultiplier : base;
}

export function getBarrelCount(fireRateLevel = 1) {
  if (fireRateLevel >= 15) return 4;
  if (fireRateLevel >= 9) return 3;
  if (fireRateLevel >= 4) return 2;
  return 1;
}

export function getBulletDamage(firePowerLevel = 1) {
  const lvl = Math.max(1, firePowerLevel);
  return Math.round(lvl + Math.pow(lvl - 1, 1.35) * 0.6);
}

export function getBaseCoinMultiplier(coinValueLevel = 1) {
  return 1 + (Math.max(1, coinValueLevel) - 1) * UPGRADE_CONFIG.coinValue.multiplierPerLevel;
}

export function getCoinMultiplier(coinValueLevel = 1, isMagnetActive = false) {
  const base = getBaseCoinMultiplier(coinValueLevel);
  return isMagnetActive ? base * UPGRADE_CONFIG.coinValue.magnetBonusMultiplier : base;
}

export function getOfflineCoinsPerMinute(offlineLevel = 1) {
  const cfg = UPGRADE_CONFIG.offlineEarnings;
  return cfg.baseCoinsPerMin + (Math.max(1, offlineLevel) - 1) * cfg.coinsPerMinPerLevel;
}

export function calculateOfflineEarnings(elapsedSeconds, offlineLevel = 1) {
  const cfg = UPGRADE_CONFIG.offlineEarnings;
  if (elapsedSeconds < cfg.minOfflineSeconds) return 0;
  const minutesAway = Math.min(cfg.maxOfflineMinutes, elapsedSeconds / 60);
  return Math.floor(minutesAway * getOfflineCoinsPerMinute(offlineLevel));
}
