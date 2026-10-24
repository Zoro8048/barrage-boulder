/**
 * SaveManager - Handles versioned localStorage persistence, schema migrations,
 * and safe state mutations. Accepts an injectable storage adapter for unit tests.
 */

import { SAVE_KEY, SAVE_SCHEMA_VERSION } from '../config/constants.js';
import { CANNON_SKINS } from '../config/skins.js';
import { ARENA_THEMES } from '../config/themes.js';
import { CANNON_VARIETIES } from '../config/cannons.js';
import { CANNON_ADDONS } from '../config/addons.js';
import { calculateOfflineEarnings } from './UpgradeMath.js';

export function createDefaultSave(now = Date.now()) {
  return {
    version: SAVE_SCHEMA_VERSION,
    coins: 0,
    bestScore: 0,
    wave: 1,
    upgrades: {
      fireRate: 1,
      firePower: 1,
      coinValue: 1,
      offlineEarnings: 1,
    },
    equipped: {
      skin: 'classic',
      theme: 'midnight',
      cannon: 'striker',
      addon: 'wingmanDrones',
    },
    settings: {
      sfxVolume: 80,
      musicVolume: 45,
      haptics: true,
    },
    stats: {
      highestWave: 1,
      rocksDestroyed: 0,
      bossesDefeated: 0,
      totalCoinsEarned: 0,
      powerupsCollected: 0,
      upgradesBought: 0,
      runsPlayed: 0,
    },
    unlockedAchievements: [],
    unlockedGear: ['cannon:striker', 'addon:wingmanDrones', 'skin:classic', 'theme:midnight'],
    hasUnseenGear: false,
    lastTimestamp: now,
  };
}

export function migrateSaveData(parsed, now = Date.now()) {
  const def = createDefaultSave(now);
  if (!parsed || typeof parsed !== 'object') return def;

  return {
    ...def,
    ...parsed,
    version: SAVE_SCHEMA_VERSION,
    upgrades: { ...def.upgrades, ...(parsed.upgrades || {}) },
    equipped: { ...def.equipped, ...(parsed.equipped || {}) },
    settings: { ...def.settings, ...(parsed.settings || {}) },
    stats: {
      ...def.stats,
      ...(parsed.stats || {}),
      highestWave: Math.max(parsed.wave || 1, parsed.stats?.highestWave || 1),
    },
    unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
      ? [...parsed.unlockedAchievements]
      : [],
    unlockedGear: Array.isArray(parsed.unlockedGear)
      ? [...parsed.unlockedGear]
      : [...def.unlockedGear],
    hasUnseenGear: Boolean(parsed.hasUnseenGear),
  };
}

export class SaveManager {
  constructor(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
    this.storage = storage;
    this.state = this.load();
  }

  load(now = Date.now()) {
    try {
      if (!this.storage) return createDefaultSave(now);
      const raw = this.storage.getItem(SAVE_KEY);
      if (!raw) return createDefaultSave(now);
      const parsed = JSON.parse(raw);
      return migrateSaveData(parsed, now);
    } catch {
      return createDefaultSave(now);
    }
  }

  persist(now = Date.now()) {
    this.state.lastTimestamp = now;
    try {
      if (this.storage) {
        this.storage.setItem(SAVE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Ignore storage quota errors
    }
  }

  reset(now = Date.now()) {
    this.state = createDefaultSave(now);
    this.persist(now);
    return this.state;
  }

  getActiveSkin() {
    return CANNON_SKINS.find((s) => s.id === this.state.equipped.skin) || CANNON_SKINS[0];
  }

  getActiveTheme() {
    return ARENA_THEMES.find((t) => t.id === this.state.equipped.theme) || ARENA_THEMES[0];
  }

  getActiveCannon() {
    return CANNON_VARIETIES.find((c) => c.id === this.state.equipped.cannon) || CANNON_VARIETIES[0];
  }

  getActiveAddon() {
    return CANNON_ADDONS.find((a) => a.id === this.state.equipped.addon) || CANNON_ADDONS[0];
  }

  getPendingOfflineReward(now = Date.now()) {
    const elapsedSeconds = (now - (this.state.lastTimestamp || now)) / 1000;
    return calculateOfflineEarnings(elapsedSeconds, this.state.upgrades.offlineEarnings);
  }
}
