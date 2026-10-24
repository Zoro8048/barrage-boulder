/**
 * Upgrade Tracks Configuration
 */

export const UPGRADE_TYPES = ['fireRate', 'firePower', 'coinValue', 'offlineEarnings'];

export const UPGRADE_CONFIG = {
  fireRate: {
    id: 'fireRate',
    title: 'FIRE RATE',
    icon: '⚡',
    baseCost: 10,
    costExponent: 1.42,
    baseShotsPerSec: 8,
    shotsPerLevel: 1.8,
    overdriveMultiplier: 1.85,
  },
  firePower: {
    id: 'firePower',
    title: 'FIRE POWER',
    icon: '💥',
    baseCost: 10,
    costExponent: 1.42,
  },
  coinValue: {
    id: 'coinValue',
    title: 'COINS',
    icon: '💰',
    baseCost: 15,
    costExponent: 1.42,
    multiplierPerLevel: 0.25,
    magnetBonusMultiplier: 1.5,
  },
  offlineEarnings: {
    id: 'offlineEarnings',
    title: 'OFFLINE',
    icon: '⏳',
    baseCost: 15,
    costExponent: 1.42,
    baseCoinsPerMin: 6,
    coinsPerMinPerLevel: 5,
    maxOfflineMinutes: 480,
    minOfflineSeconds: 60,
  },
};
