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

export function getDroneCount(highestWave = 1, firePowerLevel = 1) {
  if (highestWave >= 12 || firePowerLevel >= 10) return 2;
  if (highestWave >= 5 || firePowerLevel >= 5) return 1;
  return 0;
}

export function getComboMultiplier(comboCount = 0) {
  if (comboCount >= 50) return 2.5;
  if (comboCount >= 25) return 2.0;
  if (comboCount >= 10) return 1.5;
  if (comboCount >= 5) return 1.2;
  return 1.0;
}

export function getBulletDamage(firePowerLevel = 1) {
  const lvl = Math.max(1, firePowerLevel);
  return Math.round(lvl + Math.pow(lvl - 1, 1.35) * 0.6);
}

export function getBaseCoinMultiplier(coinValueLevel = 1) {
  return 1 + (Math.max(1, coinValueLevel) - 1) * UPGRADE_CONFIG.coinValue.multiplierPerLevel;
}

export function getCoinMultiplier(coinValueLevel = 1, isMagnetActive = false, isBossRush = false) {
  const base = getBaseCoinMultiplier(coinValueLevel);
  const magnetMult = isMagnetActive ? base * UPGRADE_CONFIG.coinValue.magnetBonusMultiplier : base;
  return isBossRush ? magnetMult * 2.0 : magnetMult;
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

export function getNextUpgradeMilestone(type, currentLevel = 1) {
  const milestones = {
    fireRate: [
      { level: 4, label: 'Lv.4: 2 Barrels' },
      { level: 9, label: 'Lv.9: 3 Barrels' },
      { level: 15, label: 'Lv.15: 4 Barrels' },
      { level: 25, label: 'Lv.25: Auto-Laser' },
    ],
    firePower: [
      { level: 10, label: 'Lv.10: +45% Exec' },
      { level: 20, label: 'Lv.20: AoE Blast' },
      { level: 30, label: 'Lv.30: 2x vs Armor' },
    ],
    coinValue: [
      { level: 10, label: 'Lv.10: +Geodes' },
      { level: 20, label: 'Lv.20: 2x Boss 🪙' },
      { level: 30, label: 'Lv.30: +Magnet' },
    ],
    offlineEarnings: [
      { level: 10, label: 'Lv.10: +1 Hull 🛡️' },
      { level: 20, label: 'Lv.20: +25% Power' },
    ],
  };

  const list = milestones[type] || [];
  const next = list.find((m) => currentLevel < m.level);
  if (next) {
    return { level: next.level, isMax: false, unlockedAll: false, text: `🎯 ${next.label}` };
  }
  return { level: null, isMax: true, unlockedAll: true, text: '✨ MAX PERKS' };
}
