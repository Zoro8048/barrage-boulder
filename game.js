/**
 * Boulder Barrage - Bundled Runtime (Generated from src/ via `npm run build`)
 * Works directly over file://, local HTTP servers, and GitHub Pages.
 */
(() => {
  "use strict";

  // --- Module: src/config/constants.js ---
  /**
   * Global Physics, Viewport & Balance Constants
   */
  const SAVE_KEY = 'boulder_barrage_save_v1';
  const SAVE_SCHEMA_VERSION = 2;
  const PHYSICS = {
    GRAVITY: 490,
    COIN_GRAVITY: 580,
    POWERUP_GRAVITY: 320,
    PARTICLE_GRAVITY: 260,
    GROUND_HEIGHT: 96,
    LOBBY_GROUND_HEIGHT: 220,
    KEY_MOVE_SPEED: 420,
    CANNON_TRACK_SMOOTHING: 22,
    CANNON_RADIUS: 26,
    BULLET_SPEED_NORMAL: -760,
    BULLET_SPEED_OVERDRIVE: -880,
    DEFAULT_MAGNET_RANGE: 115,
    BOOSTED_MAGNET_RANGE: 900,
    DEFAULT_MAGNET_SPEED: 620,
    BOOSTED_MAGNET_SPEED: 850,
    REVIVE_SHIELD_DURATION: 3.5,
    CRYO_TIME_SCALE: 0.45,
  };
  const COMBAT = {
    CRIT_CHANCE: 0.12,
    CRIT_MULTIPLIER: 2.0,
    COMBO_DECAY_TIME: 2.8,
    ULTIMATE_CHARGE_PER_HIT: 2.2,
    ULTIMATE_CHARGE_PER_KILL: 8.0,
    ULTIMATE_BEAM_DURATION: 0.85,
    DRONE_FIRE_INTERVAL: 0.65,
    DRONE_BULLET_SPEED: 680,
    DRONE_DAMAGE_RATIO: 0.55,
  };
  const ROCK_RADII = {
    1: 24,
    2: 38,
    3: 54,
  };
  const ROCK_BOUNCE_VELOCITIES = {
    1: -495,
    2: -560,
    3: -620,
  };

  // --- Module: src/config/upgrades.js ---
  /**
   * Upgrade Tracks Configuration
   */
  const UPGRADE_TYPES = ['fireRate', 'firePower', 'coinValue', 'offlineEarnings'];
  const UPGRADE_CONFIG = {
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

  // --- Module: src/config/skins.js ---
  /**
   * Unlockable Cannon Skins Registry
   * Unlocked purely via gameplay milestones (waves, score, rocks crushed, bosses defeated).
   */
  const CANNON_SKINS = [
    {
      id: 'classic',
      name: 'Classic Azure',
      reqText: 'Default Skin',
      swatch: 'linear-gradient(135deg, #38b6ff, #0062cc)',
      bodyTop: '#38b6ff',
      bodyBot: '#0062cc',
      stroke: '#70a1ff',
      barrelMid: '#c8d6e5',
      rim: '#ffcf33',
      wheelRim: '#ffcf33',
      bulletTop: '#ffffff',
      bulletMid: '#fffa65',
      bulletBot: '#ff9f1a',
      isUnlocked: () => true,
    },
    {
      id: 'crimson',
      name: 'Crimson Vanguard',
      reqText: 'Reach Wave 4',
      swatch: 'linear-gradient(135deg, #ff4757, #990012)',
      bodyTop: '#ff5e57',
      bodyBot: '#b31b1b',
      stroke: '#ff9ff3',
      barrelMid: '#dfe4ea',
      rim: '#ffa502',
      wheelRim: '#ff4757',
      bulletTop: '#ffffff',
      bulletMid: '#ff7979',
      bulletBot: '#eb2f06',
      isUnlocked: (s) => s.stats.highestWave >= 4,
    },
    {
      id: 'golden',
      name: 'Golden Sovereign',
      reqText: 'Wave 8 or 5K Score',
      swatch: 'linear-gradient(135deg, #ffdd59, #d49b00)',
      bodyTop: '#ffdd59',
      bodyBot: '#c28d00',
      stroke: '#fff3b0',
      barrelMid: '#ffeaa7',
      rim: '#ffffff',
      wheelRim: '#ffdd59',
      bulletTop: '#ffffff',
      bulletMid: '#ffeaa7',
      bulletBot: '#f39c12',
      isUnlocked: (s) => s.stats.highestWave >= 8 || s.bestScore >= 5000,
    },
    {
      id: 'neon',
      name: 'Cyber Neon',
      reqText: 'Destroy 150 Rocks',
      swatch: 'linear-gradient(135deg, #00d2d3, #5f27cd)',
      bodyTop: '#00d2d3',
      bodyBot: '#5f27cd',
      stroke: '#48dbfb',
      barrelMid: '#a29bfe',
      rim: '#00d2d3',
      wheelRim: '#ff9ff3',
      bulletTop: '#ffffff',
      bulletMid: '#48dbfb',
      bulletBot: '#9b59b6',
      isUnlocked: (s) => s.stats.rocksDestroyed >= 150 || s.stats.highestWave >= 12,
    },
    {
      id: 'obsidian',
      name: 'Void Obsidian',
      reqText: 'Defeat 5 Bosses',
      swatch: 'linear-gradient(135deg, #2f3542, #a55eea)',
      bodyTop: '#3d3d3d',
      bodyBot: '#141414',
      stroke: '#a55eea',
      barrelMid: '#747d8c',
      rim: '#a55eea',
      wheelRim: '#a55eea',
      bulletTop: '#ffffff',
      bulletMid: '#d980fa',
      bulletBot: '#8e44ad',
      isUnlocked: (s) => s.stats.bossesDefeated >= 5 || s.stats.highestWave >= 16,
    },
  ];

  // --- Module: src/config/themes.js ---
  /**
   * Unlockable Visual Arena Themes Registry
   */
  const ARENA_THEMES = [
    {
      id: 'midnight',
      name: 'Midnight Peaks',
      reqText: 'Default Arena',
      swatch: 'linear-gradient(135deg, #11172e, #2ed573)',
      skyTop: '#11172e',
      skyMid: '#1e2a52',
      skyBot: '#313d6b',
      mtnBack: '#202b52',
      mtnFront: '#182140',
      grassTop: '#2ed573',
      grassSub: '#1eae57',
      earthTop: '#19223d',
      earthBot: '#0d1224',
      isUnlocked: () => true,
    },
    {
      id: 'sunset',
      name: 'Ember Canyon',
      reqText: 'Reach Wave 3',
      swatch: 'linear-gradient(135deg, #2c0e37, #ff7f50)',
      skyTop: '#1e0b28',
      skyMid: '#4a153b',
      skyBot: '#8c2d4b',
      mtnBack: '#3c1330',
      mtnFront: '#280b20',
      grassTop: '#ff7f50',
      grassSub: '#cc5229',
      earthTop: '#2b1122',
      earthBot: '#140710',
      isUnlocked: (s) => s.stats.highestWave >= 3,
    },
    {
      id: 'arctic',
      name: 'Frostbite Tundra',
      reqText: 'Reach Wave 6',
      swatch: 'linear-gradient(135deg, #0a2342, #7ed6df)',
      skyTop: '#07162c',
      skyMid: '#12355b',
      skyBot: '#295f8a',
      mtnBack: '#1c446e',
      mtnFront: '#122f4d',
      grassTop: '#7ed6df',
      grassSub: '#22a6b3',
      earthTop: '#132a42',
      earthBot: '#091522',
      isUnlocked: (s) => s.stats.highestWave >= 6,
    },
    {
      id: 'synthwave',
      name: 'Synthwave Grid',
      reqText: 'Reach Wave 10',
      swatch: 'linear-gradient(135deg, #19052c, #f368e0)',
      skyTop: '#0d0221',
      skyMid: '#261447',
      skyBot: '#541388',
      mtnBack: '#2e0f54',
      mtnFront: '#1c0836',
      grassTop: '#f368e0',
      grassSub: '#be2edd',
      earthTop: '#1b0633',
      earthBot: '#0a0214',
      isUnlocked: (s) => s.stats.highestWave >= 10,
    },
    {
      id: 'volcanic',
      name: 'Magma Caldera',
      reqText: 'Reach Wave 15',
      swatch: 'linear-gradient(135deg, #1f0808, #ff3838)',
      skyTop: '#140505',
      skyMid: '#300b0b',
      skyBot: '#5c1414',
      mtnBack: '#2b0c0c',
      mtnFront: '#1c0707',
      grassTop: '#ff4d4d',
      grassSub: '#b33939',
      earthTop: '#240b0b',
      earthBot: '#0f0404',
      isUnlocked: (s) => s.stats.highestWave >= 15,
    },
  ];

  // --- Module: src/config/powerups.js ---
  /**
   * Power-up Drops Metadata & Durations
   */
  const POWERUP_META = {
    rapidFire: {
      id: 'rapidFire',
      icon: '⚡',
      label: 'OVERDRIVE',
      color: '#48dbfb',
      duration: 8,
    },
    shield: {
      id: 'shield',
      icon: '🛡️',
      label: 'SHIELD',
      color: '#2ed573',
      duration: 8.5,
    },
    magnet: {
      id: 'magnet',
      icon: '🧲',
      label: 'MAGNET 2X',
      color: '#ffcf33',
      duration: 10,
    },
    freeze: {
      id: 'freeze',
      icon: '❄️',
      label: 'CRYO SLOW',
      color: '#7ed6df',
      duration: 7.5,
    },
  };
  const POWERUP_DROP_CHANCE = 0.14;

  // --- Module: src/config/rockVariants.js ---
  /**
   * Rock Variants & Color Tiers Configuration
   */
  const ROCK_VARIANTS = {
    normal: {
      id: 'normal',
      badge: null,
      minWave: 1,
      hpMultiplier: 1.0,
      bounceMultiplier: 1.0,
      speedMultiplier: 1.0,
      abilityInterval: 0,
    },
    armored: {
      id: 'armored',
      badge: '🛡️',
      minWave: 2,
      hpMultiplier: 1.0,
      bounceMultiplier: 1.0,
      speedMultiplier: 1.0,
      armorDamageScale: 0.6, // 40% damage reduction while HP > 50%
      armorBreakThreshold: 0.5,
      strokeColor: '#dfe4ea',
      abilityInterval: 0,
    },
    fast: {
      id: 'fast',
      badge: '☄️',
      minWave: 3,
      hpMultiplier: 0.78,
      bounceMultiplier: 0.86,
      speedMultiplier: 1.55,
      strokeColor: '#ff6b6b',
      abilityInterval: 0,
    },
    healer: {
      id: 'healer',
      badge: '💚',
      minWave: 4,
      hpMultiplier: 1.0,
      bounceMultiplier: 1.0,
      speedMultiplier: 1.0,
      strokeColor: '#2ed573',
      abilityInterval: 2.5,
      healRadius: 170,
      healFraction: 0.1,
    },
    boss: {
      id: 'boss',
      badge: '👑',
      minWave: 3,
      hpMultiplier: 1.27,
      bounceMultiplier: 1.0,
      speedMultiplier: 1.0,
      abilityInterval: 4.5,
    },
    milestoneBoss: {
      id: 'milestoneBoss',
      badge: '👑',
      minWave: 10,
      hpMultiplier: 1.9,
      bounceMultiplier: 1.0,
      speedMultiplier: 1.0,
      abilityInterval: 4.0,
    },
  };
  function getRockColorTier(hp) {
    if (hp <= 5) return { fill: '#2ed573', stroke: '#7bed9f', dark: '#1eae57' };
    if (hp <= 15) return { fill: '#a3cb38', stroke: '#c4e538', dark: '#759622' };
    if (hp <= 35) return { fill: '#ffc312', stroke: '#ffeaa7', dark: '#d69e00' };
    if (hp <= 75) return { fill: '#f79f1f', stroke: '#ffda79', dark: '#c97a0b' };
    if (hp <= 160) return { fill: '#ee5253', stroke: '#ff9ff3', dark: '#b33939' };
    if (hp <= 350) return { fill: '#eb2f06', stroke: '#ff7979', dark: '#9e1c00' };
    return { fill: '#8e44ad', stroke: '#d980fa', dark: '#5f27cd' };
  }

  // --- Module: src/config/achievements.js ---
  /**
   * Lifetime Achievements Registry
   */
  const ACHIEVEMENTS = [
    {
      id: 'rocks_25',
      icon: '🪨',
      name: 'Pebble Breaker',
      desc: 'Destroy 25 boulders',
      reward: 50,
      progress: (s) => [s.stats.rocksDestroyed, 25],
    },
    {
      id: 'rocks_250',
      icon: '💥',
      name: 'Boulder Crusher',
      desc: 'Destroy 250 boulders',
      reward: 200,
      progress: (s) => [s.stats.rocksDestroyed, 250],
    },
    {
      id: 'rocks_1000',
      icon: '☄️',
      name: 'Meteor Obliterator',
      desc: 'Destroy 1,000 boulders',
      reward: 750,
      progress: (s) => [s.stats.rocksDestroyed, 1000],
    },
    {
      id: 'wave_5',
      icon: '🌊',
      name: 'Wave Rider',
      desc: 'Reach Wave 5',
      reward: 100,
      progress: (s) => [s.stats.highestWave, 5],
    },
    {
      id: 'wave_10',
      icon: '🚩',
      name: 'Milestone Conqueror',
      desc: 'Reach Milestone Wave 10',
      reward: 350,
      progress: (s) => [s.stats.highestWave, 10],
    },
    {
      id: 'wave_20',
      icon: '👑',
      name: 'Barrage Legend',
      desc: 'Reach Milestone Wave 20',
      reward: 1000,
      progress: (s) => [s.stats.highestWave, 20],
    },
    {
      id: 'boss_5',
      icon: '⚔️',
      name: 'Boss Slayer',
      desc: 'Defeat 5 Boss boulders',
      reward: 300,
      progress: (s) => [s.stats.bossesDefeated, 5],
    },
    {
      id: 'powerups_15',
      icon: '⚡',
      name: 'Power Surge',
      desc: 'Collect 15 Power-up drops',
      reward: 180,
      progress: (s) => [s.stats.powerupsCollected, 15],
    },
    {
      id: 'coins_5000',
      icon: '💰',
      name: 'Gold Hoarder',
      desc: 'Earn 5,000 lifetime coins',
      reward: 400,
      progress: (s) => [s.stats.totalCoinsEarned, 5000],
    },
    {
      id: 'score_10k',
      icon: '🎯',
      name: 'Sharpshooter',
      desc: 'Score 10,000 in a single run',
      reward: 300,
      progress: (s) => [s.bestScore, 10000],
    },
  ];

  // --- Module: src/core/EventBus.js ---
  /**
   * Lightweight Pub/Sub Event Bus for decoupling simulation systems from UI, Audio & Haptics.
   */
  class EventBus {
    constructor() {
      this.listeners = new Map();
    }
  
    on(event, handler) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(handler);
      return () => this.off(event, handler);
    }
  
    off(event, handler) {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    }
  
    emit(event, payload) {
      const handlers = this.listeners.get(event);
      if (!handlers) return;
      for (const handler of handlers) {
        handler(payload);
      }
    }
  }

  // --- Module: src/core/ObjectPool.js ---
  /**
   * Generic Object Pool to minimize garbage collection spikes for high-frequency entities
   * (particles, bullets, floating text, shockwaves).
   */
  class ObjectPool {
    constructor(factoryFn, resetFn = null, initialSize = 32) {
      this.factoryFn = factoryFn;
      this.resetFn = resetFn;
      this.freeList = [];
  
      for (let i = 0; i < initialSize; i++) {
        this.freeList.push(this.factoryFn());
      }
    }
  
    acquire(initProps = {}) {
      const item = this.freeList.length > 0 ? this.freeList.pop() : this.factoryFn();
      if (this.resetFn) {
        this.resetFn(item);
      }
      Object.assign(item, initProps);
      return item;
    }
  
    release(item) {
      this.freeList.push(item);
    }
  }

  // --- Module: src/core/utils.js ---
  /**
   * Common Formatting & Math Helpers
   */
  function formatNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 10_000) return (n / 1_000).toFixed(1) + 'K';
    return Math.floor(n).toLocaleString();
  }
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // --- Module: src/state/UpgradeMath.js ---
  /**
   * Pure Upgrade & Stat Calculation Functions
   */
  function getUpgradeCost(type, currentLevel = 1) {
    const cfg = UPGRADE_CONFIG[type];
    const base = cfg ? cfg.baseCost : 10;
    const exp = cfg ? cfg.costExponent : 1.42;
    return Math.floor(base * Math.pow(exp, Math.max(1, currentLevel) - 1));
  }
  function getBaseFireRateShotsPerSec(fireRateLevel = 1) {
    const cfg = UPGRADE_CONFIG.fireRate;
    return cfg.baseShotsPerSec + (Math.max(1, fireRateLevel) - 1) * cfg.shotsPerLevel;
  }
  function getFireRateShotsPerSec(fireRateLevel = 1, isOverdriveActive = false) {
    const base = getBaseFireRateShotsPerSec(fireRateLevel);
    return isOverdriveActive ? base * UPGRADE_CONFIG.fireRate.overdriveMultiplier : base;
  }
  function getBarrelCount(fireRateLevel = 1) {
    if (fireRateLevel >= 15) return 4;
    if (fireRateLevel >= 9) return 3;
    if (fireRateLevel >= 4) return 2;
    return 1;
  }
  function getDroneCount(highestWave = 1, firePowerLevel = 1) {
    if (highestWave >= 12 || firePowerLevel >= 10) return 2;
    if (highestWave >= 5 || firePowerLevel >= 5) return 1;
    return 0;
  }
  function getComboMultiplier(comboCount = 0) {
    if (comboCount >= 50) return 2.5;
    if (comboCount >= 25) return 2.0;
    if (comboCount >= 10) return 1.5;
    if (comboCount >= 5) return 1.2;
    return 1.0;
  }
  function getBulletDamage(firePowerLevel = 1) {
    const lvl = Math.max(1, firePowerLevel);
    return Math.round(lvl + Math.pow(lvl - 1, 1.35) * 0.6);
  }
  function getBaseCoinMultiplier(coinValueLevel = 1) {
    return 1 + (Math.max(1, coinValueLevel) - 1) * UPGRADE_CONFIG.coinValue.multiplierPerLevel;
  }
  function getCoinMultiplier(coinValueLevel = 1, isMagnetActive = false, isBossRush = false) {
    const base = getBaseCoinMultiplier(coinValueLevel);
    const magnetMult = isMagnetActive ? base * UPGRADE_CONFIG.coinValue.magnetBonusMultiplier : base;
    return isBossRush ? magnetMult * 2.0 : magnetMult;
  }
  function getOfflineCoinsPerMinute(offlineLevel = 1) {
    const cfg = UPGRADE_CONFIG.offlineEarnings;
    return cfg.baseCoinsPerMin + (Math.max(1, offlineLevel) - 1) * cfg.coinsPerMinPerLevel;
  }
  function calculateOfflineEarnings(elapsedSeconds, offlineLevel = 1) {
    const cfg = UPGRADE_CONFIG.offlineEarnings;
    if (elapsedSeconds < cfg.minOfflineSeconds) return 0;
    const minutesAway = Math.min(cfg.maxOfflineMinutes, elapsedSeconds / 60);
    return Math.floor(minutesAway * getOfflineCoinsPerMinute(offlineLevel));
  }

  // --- Module: src/state/SaveManager.js ---
  /**
   * SaveManager - Handles versioned localStorage persistence, schema migrations,
   * and safe state mutations. Accepts an injectable storage adapter for unit tests.
   */
  function createDefaultSave(now = Date.now()) {
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
      lastTimestamp: now,
    };
  }
  function migrateSaveData(parsed, now = Date.now()) {
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
    };
  }
  class SaveManager {
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
  
    getPendingOfflineReward(now = Date.now()) {
      const elapsedSeconds = (now - (this.state.lastTimestamp || now)) / 1000;
      return calculateOfflineEarnings(elapsedSeconds, this.state.upgrades.offlineEarnings);
    }
  }

  // --- Module: src/state/AchievementTracker.js ---
  /**
   * AchievementTracker - Evaluates player progression against ACHIEVEMENTS catalog
   * and emits unlock events via EventBus.
   */
  class AchievementTracker {
    constructor(saveManager, bus) {
      this.saveManager = saveManager;
      this.bus = bus;
    }
  
    checkUnlockables() {
      const save = this.saveManager.state;
      const newlyUnlocked = [];
  
      for (const ach of ACHIEVEMENTS) {
        if (save.unlockedAchievements.includes(ach.id)) continue;
        const [cur, target] = ach.progress(save);
        if (cur >= target) {
          save.unlockedAchievements.push(ach.id);
          save.coins += ach.reward;
          save.stats.totalCoinsEarned += ach.reward;
          newlyUnlocked.push(ach);
          if (this.bus) {
            this.bus.emit('achievement:unlocked', ach);
          }
        }
      }
  
      if (newlyUnlocked.length > 0) {
        this.saveManager.persist();
        if (this.bus) {
          this.bus.emit('state:updated', save);
        }
      }
  
      return newlyUnlocked;
    }
  }

  // --- Module: src/entities/Cannon.js ---
  /**
   * Cannon Entity - Represents the player's mobile turret and extensible Wingman Drone slots.
   */
  class Cannon {
    constructor(x = 200, y = 600) {
      this.x = x;
      this.targetX = x;
      this.y = y;
      this.radius = PHYSICS.CANNON_RADIUS;
      this.wheelAngle = 0;
      this.recoil = 0;
      this.shootCooldown = 0;
      this.droneCooldown = COMBAT.DRONE_FIRE_INTERVAL;
      this.droneBobPhase = 0;
      this.muzzleFlash = 0;
    }
  
    setBounds(width, groundY) {
      this.y = groundY;
      this.x = clamp(this.x, this.radius, width - this.radius);
      this.targetX = clamp(this.targetX, this.radius, width - this.radius);
    }
  
    center(width, groundY) {
      this.y = groundY;
      this.x = width / 2;
      this.targetX = width / 2;
    }
  
    update(dt, width, keyMoveDir = 0) {
      if (keyMoveDir !== 0) {
        this.targetX = clamp(
          this.targetX + keyMoveDir * PHYSICS.KEY_MOVE_SPEED * dt,
          this.radius,
          width - this.radius
        );
      }
  
      const prevX = this.x;
      this.x += (this.targetX - this.x) * Math.min(1, dt * PHYSICS.CANNON_TRACK_SMOOTHING);
      this.x = clamp(this.x, this.radius, width - this.radius);
  
      const dx = this.x - prevX;
      this.wheelAngle += dx / 13;
      this.droneBobPhase += dt * 4.5;
  
      if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 28);
      if (this.muzzleFlash > 0) this.muzzleFlash = Math.max(0, this.muzzleFlash - dt * 14);
      if (this.shootCooldown > 0) this.shootCooldown -= dt;
      if (this.droneCooldown > 0) this.droneCooldown -= dt;
    }
  }

  // --- Module: src/entities/Rock.js ---
  /**
   * Rock Entity Factory & Polygon Vertex Builder
   */
  function createRock({
    x,
    y,
    vx,
    vy,
    size,
    hp,
    isBoss = false,
    isMilestone = false,
    variant = 'normal',
    fromSplit = false,
  }) {
    const bossScale = isMilestone ? 1.32 : isBoss ? 1.18 : 1;
    const radius = (ROCK_RADII[size] || 36) * bossScale;
    const sides = isMilestone ? 12 : isBoss ? 10 : variant === 'fast' ? 6 : size === 3 ? 9 : 7;
  
    const vertices = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const jitter = variant === 'healer' ? 0.94 : 0.9 + Math.sin(i * 2.7 + hp) * 0.08;
      vertices.push({
        x: Math.cos(angle) * radius * jitter,
        y: Math.sin(angle) * radius * jitter,
      });
    }
  
    const varCfg = ROCK_VARIANTS[variant] || ROCK_VARIANTS.normal;
    // Each boulder gets its own natural bounciness (0.92x to 1.16x) so rocks don't bounce in lockstep
    const bounceFactor = 0.92 + Math.random() * 0.24;
  
    return {
      x,
      y,
      vx,
      vy,
      size,
      radius,
      hp,
      maxHp: hp,
      isBoss,
      isMilestone,
      variant,
      bounceFactor,
      armorBroken: variant !== 'armored',
      abilityTimer: varCfg.abilityInterval || 0,
      bossShieldTimer: 0,
      angle: Math.random() * Math.PI * 2,
      vAngle: (vx > 0 ? 1 : -1) * (variant === 'fast' ? 2.4 : 0.8 + Math.random() * 1.2),
      hitScale: fromSplit ? 1.22 : 1,
      hitFlash: fromSplit ? 0.4 : 0,
      vertices,
    };
  }

  // --- Module: src/systems/WaveSystem.js ---
  /**
   * WaveSystem - Generates wave rock queues, calculates total wave HP (including child splits),
   * and schedules rock spawns for both Standard and Boss Rush modes.
   */
  function pickRockVariant(waveNum, isBoss, isMilestone, rng = Math.random) {
    if (isMilestone) return 'milestoneBoss';
    if (isBoss) return 'boss';
    const roll = rng();
    if (waveNum >= 4 && roll < 0.16) return 'healer';
    if (waveNum >= 3 && roll < 0.34) return 'fast';
    if (waveNum >= 2 && roll < 0.52) return 'armored';
    return 'normal';
  }
  function calculateWaveTotalHP(rockQueue) {
    return rockQueue.reduce((acc, r) => {
      if (r.size === 3) {
        const half = Math.max(1, Math.floor(r.hp * 0.5));
        const quarter = Math.max(1, Math.floor(half * 0.5));
        return acc + r.hp + 2 * half + 4 * quarter;
      }
      if (r.size === 2) {
        const half = Math.max(1, Math.floor(r.hp * 0.5));
        return acc + r.hp + 2 * half;
      }
      return acc + r.hp;
    }, 0);
  }
  function getWaveBaseHP(waveNum) {
    // Smooth piecewise exponential curve so Wave 25-50+ doesn't outscale player DPS
    if (waveNum <= 12) {
      return Math.max(2, Math.round(4 * Math.pow(1.3, waveNum - 1)));
    }
    const hpAt12 = 4 * Math.pow(1.3, 11);
    if (waveNum <= 25) {
      return Math.round(hpAt12 * Math.pow(1.19, waveNum - 12));
    }
    const hpAt25 = hpAt12 * Math.pow(1.19, 13);
    return Math.round(hpAt25 * Math.pow(1.12, waveNum - 25));
  }
  class WaveSystem {
    constructor(bus) {
      this.bus = bus;
      this.waveRocksToSpawn = [];
      this.waveTotalHP = 100;
      this.waveDamageDealt = 0;
      this.spawnTimer = 0.4;
    }
  
    setupWave(waveNum, isPlaying = false, rng = Math.random, isBossRush = false) {
      this.waveRocksToSpawn = [];
      this.waveDamageDealt = 0;
  
      const isMilestoneWave = waveNum % 10 === 0 || (isBossRush && waveNum % 3 === 0);
      const isBossWave = isBossRush || waveNum % 3 === 0 || isMilestoneWave;
  
      const baseHP = getWaveBaseHP(waveNum);
  
      if (isBossRush) {
        // Boss Rush Mode: 2 to 3 high-intensity Boss & Escort boulders per wave
        const bossCount = 2 + (waveNum >= 5 ? 1 : 0);
        for (let i = 0; i < bossCount; i++) {
          const isFinal = i === bossCount - 1;
          const isMilestone = isFinal && isMilestoneWave;
          const variant = isMilestone ? 'milestoneBoss' : isFinal ? 'boss' : pickRockVariant(waveNum, true, false, rng);
          const size = isFinal ? 3 : 2;
          const sizeMult = isMilestone ? 3.8 : isFinal ? 2.6 : 1.6;
          const hp = Math.max(2, Math.round(baseHP * sizeMult));
  
          this.waveRocksToSpawn.push({
            size,
            hp,
            isBoss: true,
            isMilestone,
            variant,
          });
        }
      } else {
        const rockCount = isMilestoneWave
          ? 3 + Math.min(4, Math.floor(waveNum * 0.4))
          : 4 + Math.min(8, Math.floor(waveNum * 0.85));
  
        for (let i = 0; i < rockCount; i++) {
          const isFinalRock = i === rockCount - 1;
          const isBoss = isFinalRock && isBossWave;
          let size = 2;
  
          if (isBoss) {
            size = 3;
          } else if (isFinalRock && waveNum >= 2) {
            size = 3;
          } else if (rng() < 0.35) {
            size = 1;
          } else if (waveNum >= 3 && rng() < 0.3) {
            size = 3;
          }
  
          const variant = pickRockVariant(waveNum, isBoss, isBoss && isMilestoneWave, rng);
          let sizeMult = size === 3 ? 2.2 : size === 2 ? 1.2 : 0.6;
          if (variant === 'milestoneBoss') sizeMult = 4.2;
          else if (variant === 'boss') sizeMult = 2.8;
          else if (variant === 'fast') sizeMult *= 0.78;
  
          const hp = Math.max(1, Math.round(baseHP * sizeMult * (0.85 + rng() * 0.3)));
  
          this.waveRocksToSpawn.push({
            size,
            hp,
            isBoss,
            isMilestone: variant === 'milestoneBoss',
            variant,
          });
        }
      }
  
      this.waveTotalHP = calculateWaveTotalHP(this.waveRocksToSpawn);
      this.spawnTimer = 0.4;
  
      if (this.bus) {
        this.bus.emit('wave:updated', {
          waveNum,
          damageDealt: this.waveDamageDealt,
          totalHP: this.waveTotalHP,
        });
  
        if (isPlaying && isMilestoneWave) {
          this.bus.emit('wave:milestoneAlert', { waveNum });
        }
      }
    }
  
    update(dt, waveNum, activeRocks, width) {
      if (this.waveRocksToSpawn.length === 0) return;
  
      this.spawnTimer -= dt;
      // Weight active rocks by size so a screen full of splitting boulders doesn't get flooded
      const activeWeight = activeRocks.reduce(
        (sum, r) => sum + (r.size === 3 ? 2.0 : r.size === 2 ? 1.35 : 0.85),
        0
      );
      const maxWeight = 4.2 + Math.min(2.5, Math.floor(waveNum / 6) * 0.5);
  
      if (this.spawnTimer <= 0 && (activeRocks.length === 0 || activeWeight < maxWeight)) {
        this.spawnNextRock(activeRocks, width);
        // Stagger spawns further apart when multiple rocks are already active on screen
        const crowdDelay = activeRocks.length * 0.55;
        this.spawnTimer = Math.max(1.8, 2.5 - Math.min(0.8, waveNum * 0.03) + crowdDelay);
      }
    }
  
    spawnNextRock(activeRocks, width) {
      if (this.waveRocksToSpawn.length === 0) return null;
      const spec = this.waveRocksToSpawn.shift();
      const fromLeft = Math.random() < 0.5;
      const radius = ROCK_RADII[spec.size] || 38;
      const x = fromLeft ? -radius * 0.5 : width + radius * 0.5;
      const y = 90 + Math.random() * 85;
      const baseSpeed = spec.variant === 'fast' ? 140 + Math.random() * 65 : 75 + Math.random() * 55;
      const speedX = (fromLeft ? 1 : -1) * baseSpeed;
  
      if (spec.isBoss && this.bus) {
        this.bus.emit('boss:spawned', spec);
      }
  
      const rock = createRock({
        x,
        y,
        vx: speedX,
        vy: -40,
        size: spec.size,
        hp: spec.hp,
        isBoss: spec.isBoss,
        isMilestone: spec.isMilestone,
        variant: spec.variant,
        fromSplit: false,
      });
  
      activeRocks.push(rock);
      return rock;
    }
  }

  // --- Module: src/systems/InputSystem.js ---
  /**
   * InputSystem - Normalizes pointer, touch, mouse, and keyboard inputs.
   */
  class InputSystem {
    constructor(canvas, cannon, callbacks = {}) {
      this.canvas = canvas;
      this.cannon = cannon;
      this.callbacks = callbacks;
      this.isDragging = false;
      this.keys = {
        left: false,
        right: false,
        space: false,
      };
  
      this.bindEvents();
    }
  
    reset() {
      this.isDragging = false;
      this.keys.left = false;
      this.keys.right = false;
      this.keys.space = false;
    }
  
    isFiring() {
      return this.isDragging || this.keys.space;
    }
  
    getKeyMoveDirection() {
      return (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
    }
  
    updatePointerTarget(clientX) {
      const rect = this.canvas.getBoundingClientRect();
      const relX = clientX - rect.left;
      const width = this.callbacks.getViewportWidth ? this.callbacks.getViewportWidth() : rect.width;
      this.cannon.targetX = clamp(relX, this.cannon.radius, width - this.cannon.radius);
    }
  
    bindEvents() {
      const canInteract = () =>
        (!this.callbacks.canInteract || this.callbacks.canInteract()) &&
        (!this.callbacks.isModalOpen || !this.callbacks.isModalOpen());
  
      this.canvas.addEventListener('pointerdown', (e) => {
        if (!canInteract()) return;
        this.isDragging = true;
        this.canvas.setPointerCapture(e.pointerId);
        this.updatePointerTarget(e.clientX);
        if (this.callbacks.onActionStart) {
          this.callbacks.onActionStart();
        }
      });
  
      this.canvas.addEventListener('pointermove', (e) => {
        if (!this.isDragging) return;
        this.updatePointerTarget(e.clientX);
      });
  
      const endDrag = () => {
        this.isDragging = false;
      };
      this.canvas.addEventListener('pointerup', endDrag);
      this.canvas.addEventListener('pointercancel', endDrag);
  
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          this.callbacks.onTogglePause?.();
          return;
        }
        if (e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
          e.preventDefault();
          this.callbacks.onTriggerUltimate?.();
          return;
        }
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Space') {
          e.preventDefault();
        }
        if (!canInteract()) return;
  
        if (e.code === 'ArrowLeft') {
          this.keys.left = true;
          this.callbacks.onActionStart?.();
        } else if (e.code === 'ArrowRight') {
          this.keys.right = true;
          this.callbacks.onActionStart?.();
        } else if (e.code === 'Space') {
          this.keys.space = true;
          this.callbacks.onActionStart?.();
        }
      });
  
      window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft') this.keys.left = false;
        if (e.code === 'ArrowRight') this.keys.right = false;
        if (e.code === 'Space') this.keys.space = false;
      });
  
      window.addEventListener('blur', () => this.reset());
    }
  }

  // --- Module: src/systems/PhysicsSystem.js ---
  /**
   * PhysicsSystem - Updates positions, gravity, wall/ground bounces, and magnetic collection
   * for rocks, coins, power-up orbs, particles, shockwaves, and floating text.
   */
  class PhysicsSystem {
    constructor(bus) {
      this.bus = bus;
    }
  
    updateRocks(dt, engine) {
      const {
        rocks,
        cannon,
        width,
        groundY,
        gameState,
        invulnerableTimer,
        activePowerups,
        combatSystem,
      } = engine;
  
      const timeScale = activePowerups.freeze > 0 ? PHYSICS.CRYO_TIME_SCALE : 1;
      const rDt = dt * timeScale;
  
      for (let i = rocks.length - 1; i >= 0; i--) {
        const r = rocks[i];
        r.vy += PHYSICS.GRAVITY * rDt;
        r.x += r.vx * rDt;
        r.y += r.vy * rDt;
        r.angle += r.vAngle * rDt;
  
        if (r.hitScale > 1) r.hitScale = Math.max(1, r.hitScale - dt * 1.8);
        if (r.hitFlash > 0) r.hitFlash = Math.max(0, r.hitFlash - dt * 2.5);
        if (r.bossShieldTimer > 0) r.bossShieldTimer = Math.max(0, r.bossShieldTimer - dt);
  
        if (r.abilityTimer > 0 && gameState === 'PLAYING') {
          r.abilityTimer -= rDt;
          if (r.abilityTimer <= 0) {
            combatSystem.triggerRockSpecialAbility(r, engine);
          }
        }
  
        // Fast meteor fiery trail
        if (r.variant === 'fast' && Math.random() < 0.35) {
          engine.spawnParticle({
            x: r.x + (Math.random() - 0.5) * r.radius * 0.6,
            y: r.y + (Math.random() - 0.5) * r.radius * 0.6,
            vx: -r.vx * 0.2,
            vy: -30,
            r: 2.2 + Math.random() * 2.5,
            color: '#ff6b6b',
            life: 0.6,
            decay: 2.2,
          });
        }
  
        // Wall bounce
        if (r.x - r.radius < 0 && r.vx < 0) {
          r.x = r.radius;
          r.vx = Math.abs(r.vx);
          r.vAngle = Math.abs(r.vAngle);
        } else if (r.x + r.radius > width && r.vx > 0) {
          r.x = width - r.radius;
          r.vx = -Math.abs(r.vx);
          r.vAngle = -Math.abs(r.vAngle);
        }
  
        // Ground bounce (varied per rock + slight per-bounce jitter to prevent synchronized walls)
        if (r.y + r.radius >= groundY) {
          r.y = groundY - r.radius;
          const baseBounce = ROCK_BOUNCE_VELOCITIES[r.size] || -550;
          const varCfg = ROCK_VARIANTS[r.variant] || ROCK_VARIANTS.normal;
          const perRockMult = r.bounceFactor || 1.0;
          const liveJitter = 0.95 + Math.random() * 0.1;
          r.vy = baseBounce * (varCfg.bounceMultiplier || 1) * perRockMult * liveJitter;
          r.hitScale = 1.1;
          engine.addParticles(r.x, groundY, 'rgba(255,255,255,0.35)', 4, 70);
        }
  
        // Cannon collision
        if (gameState === 'PLAYING') {
          const cannonCenterY = cannon.y - 24;
          const distSq = (r.x - cannon.x) ** 2 + (r.y - cannonCenterY) ** 2;
          const hitDist = r.radius + cannon.radius - 7;
          if (distSq <= hitDist * hitDist) {
            if (invulnerableTimer > 0 || activePowerups.shield > 0) {
              r.vy = -510;
              r.y = Math.min(r.y, cannonCenterY - hitDist - 4);
              this.bus.emit('sfx:hit', { hpRatio: 0.2, armored: true });
              engine.triggerShake(6, 0.14);
              engine.addParticles(r.x, r.y + r.radius * 0.5, '#2ed573', 10, 180);
            } else {
              engine.triggerGameOver();
              break;
            }
          }
        }
      }
    }
  
    updatePowerups(dt, engine) {
      const { powerups, cannon, width, groundY } = engine;
      for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.vy += PHYSICS.POWERUP_GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.bobPhase += dt * 6;
        p.life -= dt;
  
        if (p.x < p.radius) {
          p.x = p.radius;
          p.vx *= -0.7;
        } else if (p.x > width - p.radius) {
          p.x = width - p.radius;
          p.vx *= -0.7;
        }
  
        if (p.y + p.radius >= groundY) {
          p.y = groundY - p.radius;
          p.vy = -170;
          p.vx *= 0.85;
        }
  
        const dxC = cannon.x - p.x;
        const dyC = cannon.y - 22 - p.y;
        const dist = Math.hypot(dxC, dyC);
        if (dist < 130) {
          p.x += (dxC / (dist || 1)) * 320 * dt;
          p.y += (dyC / (dist || 1)) * 320 * dt;
        }
  
        if (dist < cannon.radius + p.radius + 8) {
          engine.activatePowerup(p.type, p.x, p.y);
          powerups.splice(i, 1);
        } else if (p.life <= 0) {
          powerups.splice(i, 1);
        }
      }
    }
  
    updateCoins(dt, engine) {
      const { coins, cannon, width, groundY, activePowerups } = engine;
      const isMagnet = activePowerups.magnet > 0;
      const magnetRange = isMagnet ? PHYSICS.BOOSTED_MAGNET_RANGE : PHYSICS.DEFAULT_MAGNET_RANGE;
      const magnetSpeed = isMagnet ? PHYSICS.BOOSTED_MAGNET_SPEED : PHYSICS.DEFAULT_MAGNET_SPEED;
  
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        c.vy += PHYSICS.COIN_GRAVITY * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.spin += dt * 9;
        c.life -= dt;
  
        if (c.x < c.radius) {
          c.x = c.radius;
          c.vx *= -0.6;
        } else if (c.x > width - c.radius) {
          c.x = width - c.radius;
          c.vx *= -0.6;
        }
  
        if (c.y + c.radius >= groundY) {
          c.y = groundY - c.radius;
          c.vy *= -0.45;
          c.vx *= 0.82;
          if (Math.abs(c.vy) < 25) c.vy = 0;
        }
  
        const dxC = cannon.x - c.x;
        const dyC = cannon.y - 20 - c.y;
        const dist = Math.hypot(dxC, dyC);
        if (dist < magnetRange) {
          const pull = (1 - Math.min(0.85, dist / magnetRange)) * magnetSpeed;
          c.x += (dxC / (dist || 1)) * pull * dt;
          c.y += (dyC / (dist || 1)) * pull * dt;
        }
  
        if (dist < cannon.radius + c.radius + 8 || c.life <= 0) {
          this.bus.emit('sfx:coin');
          engine.awardCoins(c.value, c.x, c.y - 10);
          coins.splice(i, 1);
        }
      }
    }
  
    updateVFX(dt, engine) {
      const { shockwaves, particles, floatingTexts, particlePool, textPool } = engine;
  
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * Math.min(1, dt * 8);
        sw.life -= dt * 2.2;
        if (sw.life <= 0) shockwaves.splice(i, 1);
      }
  
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += PHYSICS.PARTICLE_GRAVITY * dt;
        p.life -= p.decay * dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          particlePool.release(p);
        }
      }
  
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy * dt;
        ft.life -= dt * 1.35;
        if (ft.life <= 0) {
          floatingTexts.splice(i, 1);
          textPool.release(ft);
        }
      }
    }
  }

  // --- Module: src/systems/CombatSystem.js ---
  /**
   * CombatSystem - Handles volley firing, Wingman Drone targeting, Critical Hits,
   * Combo multipliers, Ultimate Supernova Beam, armor cracking, rock splitting, and boss skills.
   */
  class CombatSystem {
    constructor(bus) {
      this.bus = bus;
    }
  
    fireVolley(engine) {
      const { cannon, bullets, bulletPool } = engine;
      const barrels = engine.getBarrelCount();
      const spacing = 11;
      const totalSpan = (barrels - 1) * spacing;
      const isOverdrive = engine.activePowerups.rapidFire > 0;
  
      for (let i = 0; i < barrels; i++) {
        const offsetX = -totalSpan / 2 + i * spacing;
        bullets.push(
          bulletPool.acquire({
            x: cannon.x + offsetX,
            y: cannon.y - 48,
            vx: offsetX * 1.4,
            vy: isOverdrive ? PHYSICS.BULLET_SPEED_OVERDRIVE : PHYSICS.BULLET_SPEED_NORMAL,
            radius: isOverdrive ? 6.2 : 5.5,
            overdrive: isOverdrive,
            isDrone: false,
            damageRatio: 1.0,
          })
        );
      }
  
      cannon.recoil = 6;
      cannon.muzzleFlash = 1;
      this.bus.emit('sfx:shoot', { overdrive: isOverdrive });
    }
  
    fireDrones(engine) {
      const { cannon, rocks, bullets, bulletPool } = engine;
      const droneCount = engine.getDroneCount();
      if (droneCount <= 0 || rocks.length === 0) return;
  
      // Target the boulder closest to the ground
      let target = rocks[0];
      for (const r of rocks) {
        if (r.y + r.radius > target.y + target.radius) {
          target = r;
        }
      }
  
      const offsets = droneCount >= 2 ? [-44, 44] : [-44];
      const bobY = Math.sin(cannon.droneBobPhase) * 4;
  
      for (const ox of offsets) {
        const sx = cannon.x + ox;
        const sy = cannon.y - 34 + bobY;
        const dx = target.x - sx;
        const dy = target.y - sy;
        const dist = Math.hypot(dx, dy) || 1;
  
        bullets.push(
          bulletPool.acquire({
            x: sx,
            y: sy,
            vx: (dx / dist) * COMBAT.DRONE_BULLET_SPEED,
            vy: (dy / dist) * COMBAT.DRONE_BULLET_SPEED,
            radius: 4.8,
            overdrive: false,
            isDrone: true,
            damageRatio: COMBAT.DRONE_DAMAGE_RATIO,
          })
        );
      }
    }
  
    triggerUltimate(engine) {
      if (engine.gameState !== 'PLAYING' || engine.ultimateCharge < 100) return false;
  
      engine.ultimateCharge = 0;
      engine.ultimateBeamTimer = COMBAT.ULTIMATE_BEAM_DURATION;
      engine.invulnerableTimer = Math.max(engine.invulnerableTimer, 2.0);
      engine.triggerShake(15, 0.4);
      engine.addShockwave(engine.cannon.x, engine.cannon.y - 40, 420, 'rgba(72, 219, 251, 0.9)');
      engine.addFloatingText(engine.width / 2, engine.height * 0.36, '☄️ ORBITAL SUPERNOVA!', '#48dbfb', 20);
  
      const ultDamage = Math.max(15, Math.round(engine.getBulletDamage() * 14));
      const save = engine.saveManager.state;
  
      for (let j = engine.rocks.length - 1; j >= 0; j--) {
        const r = engine.rocks[j];
        r.armorBroken = true;
        r.bossShieldTimer = 0;
        const actualDmg = Math.min(r.hp, ultDamage);
        r.hp -= actualDmg;
        engine.score += actualDmg;
        engine.waveSystem.waveDamageDealt += actualDmg;
        if (engine.score > save.bestScore) {
          save.bestScore = engine.score;
        }
  
        r.vy = -480;
        r.hitScale = 1.3;
        r.hitFlash = 0.6;
        engine.addParticles(r.x, r.y, '#48dbfb', 10, 220);
  
        if (r.hp <= 0) {
          this.destroyRock(r, j, engine, true);
        }
      }
  
      this.bus.emit('sfx:ultimate');
      this.bus.emit('ultimate:updated', engine.ultimateCharge);
      this.bus.emit('hud:scoreUpdated');
      this.bus.emit('wave:updated', {
        waveNum: save.wave,
        damageDealt: engine.waveSystem.waveDamageDealt,
        totalHP: engine.waveSystem.waveTotalHP,
      });
      return true;
    }
  
    updateBullets(dt, engine) {
      const { bullets, bulletPool, rocks, width, saveManager, waveSystem } = engine;
      const save = saveManager.state;
      const baseBulletDmg = engine.getBulletDamage();
  
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
  
        if (b.y < -30 || b.y > engine.height + 20 || b.x < -20 || b.x > width + 20) {
          bullets.splice(i, 1);
          bulletPool.release(b);
          continue;
        }
  
        let hit = false;
        for (let j = rocks.length - 1; j >= 0; j--) {
          const r = rocks[j];
          const distSq = (b.x - r.x) ** 2 + (b.y - r.y) ** 2;
          if (distSq <= (r.radius + b.radius) ** 2) {
            hit = true;
  
            if (r.bossShieldTimer > 0) {
              this.bus.emit('sfx:hit', { hpRatio: 1, armored: true });
              engine.addParticles(b.x, b.y, '#48dbfb', 4, 110);
              break;
            }
  
            // Roll Critical Hit
            const isCrit = !b.isDrone && Math.random() < COMBAT.CRIT_CHANCE;
            const critMult = isCrit ? COMBAT.CRIT_MULTIPLIER : 1.0;
            const scaledDmg = Math.max(1, Math.round(baseBulletDmg * (b.damageRatio || 1) * critMult));
  
            const hasIntactArmor = r.variant === 'armored' && !r.armorBroken;
            const armorScale = ROCK_VARIANTS.armored.armorDamageScale;
            const rawDmg = hasIntactArmor ? Math.max(1, Math.round(scaledDmg * armorScale)) : scaledDmg;
            const actualDmg = Math.min(r.hp, rawDmg);
  
            r.hp -= actualDmg;
  
            // Build Combo & Ultimate Charge
            engine.comboCount += 1;
            engine.comboTimer = COMBAT.COMBO_DECAY_TIME;
            const comboMult = getComboMultiplier(engine.comboCount);
            const scoreGain = Math.round(actualDmg * comboMult);
  
            engine.score += scoreGain;
            waveSystem.waveDamageDealt += actualDmg;
            if (engine.score > save.bestScore) {
              save.bestScore = engine.score;
            }
  
            engine.addUltimateCharge(COMBAT.ULTIMATE_CHARGE_PER_HIT);
  
            if (isCrit) {
              engine.addFloatingText(
                b.x,
                b.y - 12,
                `💥 ${formatNum(actualDmg)}!`,
                '#ff4757',
                14
              );
            }
  
            if (hasIntactArmor && r.hp <= r.maxHp * ROCK_VARIANTS.armored.armorBreakThreshold && r.hp > 0) {
              r.armorBroken = true;
              engine.addParticles(r.x, r.y, '#dfe4ea', 14, 200);
              engine.addFloatingText(r.x, r.y - r.radius, 'ARMOR CRACKED!', '#dfe4ea', 13);
            }
  
            r.hitScale = isCrit ? 1.22 : 1.15;
            r.hitFlash = 0.22;
            if (r.vy > -120) r.vy -= 12;
  
            this.bus.emit('sfx:hit', { hpRatio: r.hp / r.maxHp, armored: hasIntactArmor });
            engine.addParticles(b.x, b.y, isCrit ? '#ff4757' : hasIntactArmor ? '#dfe4ea' : '#fffa65', isCrit ? 6 : 3, 110);
  
            if (r.hp <= 0) {
              this.destroyRock(r, j, engine, false);
            }
  
            this.bus.emit('hud:scoreUpdated');
            this.bus.emit('combo:updated', {
              count: engine.comboCount,
              multiplier: comboMult,
            });
            this.bus.emit('wave:updated', {
              waveNum: save.wave,
              damageDealt: waveSystem.waveDamageDealt,
              totalHP: waveSystem.waveTotalHP,
            });
            break;
          }
        }
  
        if (hit) {
          bullets.splice(i, 1);
          bulletPool.release(b);
        }
      }
    }
  
    destroyRock(rock, index, engine, fromUltimate = false) {
      const { rocks, saveManager, waveSystem, achievementTracker } = engine;
      const save = saveManager.state;
      const col = getRockColorTier(rock.maxHp);
  
      engine.addParticles(rock.x, rock.y, col.fill, rock.size * 8, 220);
      this.bus.emit('rock:destroyed', { size: rock.size, isBoss: rock.isBoss });
      engine.triggerShake(rock.size * 3.5, 0.16);
  
      if (!fromUltimate) {
        engine.addUltimateCharge(COMBAT.ULTIMATE_CHARGE_PER_KILL);
      }
  
      save.stats.rocksDestroyed += 1;
      if (rock.isBoss) {
        save.stats.bossesDefeated += 1;
        engine.maybeSpawnPowerup(rock.x, rock.y, true);
        engine.spawnCoinBurst(rock.x, rock.y, rock.isMilestone ? 12 : 6);
      } else if (rock.size === 1) {
        engine.maybeSpawnPowerup(rock.x, rock.y, false);
      }
  
      rocks.splice(index, 1);
  
      if (rock.size > 1) {
        const childSize = rock.size - 1;
        const childHp = Math.max(1, Math.floor(rock.maxHp * 0.5));
        const spreadVx = (rock.variant === 'fast' ? 115 : 80) + Math.random() * 35;
        // Asymmetric vertical pop velocities so split halves land at different times
        const popVyLeft = -315 - Math.random() * 45;
        const popVyRight = -225 - Math.random() * 40;
        const childVariant =
          rock.variant === 'boss' || rock.variant === 'milestoneBoss' ? 'normal' : rock.variant;
  
        rocks.push(
          createRock({
            x: rock.x - 12,
            y: rock.y,
            vx: -spreadVx,
            vy: popVyLeft,
            size: childSize,
            hp: childHp,
            isBoss: false,
            variant: childVariant,
            fromSplit: true,
          }),
          createRock({
            x: rock.x + 12,
            y: rock.y,
            vx: spreadVx * (0.88 + Math.random() * 0.24),
            vy: popVyRight,
            size: childSize,
            hp: childHp,
            isBoss: false,
            variant: childVariant,
            fromSplit: true,
          })
        );
        engine.spawnCoinBurst(rock.x, rock.y, 1);
      } else {
        engine.spawnCoinBurst(rock.x, rock.y, rock.variant === 'healer' ? 5 : 3);
      }
  
      achievementTracker.checkUnlockables();
  
      if (rocks.length === 0 && waveSystem.waveRocksToSpawn.length === 0 && engine.gameState === 'PLAYING') {
        engine.onWaveComplete();
      }
    }
  
    triggerRockSpecialAbility(r, engine) {
      const { rocks, waveSystem, saveManager } = engine;
  
      if (r.variant === 'healer') {
        const cfg = ROCK_VARIANTS.healer;
        let healedAny = false;
        for (const other of rocks) {
          if (other === r) continue;
          const dist = Math.hypot(other.x - r.x, other.y - r.y);
          if (dist < cfg.healRadius && other.hp < other.maxHp) {
            const healAmt = Math.max(1, Math.round(other.maxHp * cfg.healFraction));
            const actualHeal = Math.min(other.maxHp - other.hp, healAmt);
            other.hp += actualHeal;
            waveSystem.waveDamageDealt = Math.max(0, waveSystem.waveDamageDealt - actualHeal);
            healedAny = true;
            engine.addFloatingText(
              other.x,
              other.y - other.radius,
              `+${formatNum(actualHeal)} 💚`,
              '#2ed573',
              13
            );
          }
        }
        engine.addShockwave(r.x, r.y, 150, 'rgba(46, 213, 115, 0.65)');
        if (healedAny) {
          this.bus.emit('wave:updated', {
            waveNum: saveManager.state.wave,
            damageDealt: waveSystem.waveDamageDealt,
            totalHP: waveSystem.waveTotalHP,
          });
        }
        r.abilityTimer = cfg.abilityInterval;
      } else if (r.isMilestone) {
        if (Math.random() < 0.5 && rocks.length < 7) {
          const miniHp = Math.max(2, Math.round(r.maxHp * 0.12));
          waveSystem.waveTotalHP += miniHp * 2;
          for (const dir of [-1, 1]) {
            rocks.push(
              createRock({
                x: r.x + dir * 24,
                y: r.y,
                vx: dir * 135,
                vy: -220,
                size: 1,
                hp: miniHp,
                variant: 'fast',
                fromSplit: true,
              })
            );
          }
          engine.addShockwave(r.x, r.y, 130, 'rgba(255, 71, 87, 0.75)');
          engine.addFloatingText(r.x, r.y - r.radius - 14, '☄️ METEOR SWARM!', '#ff4757', 15);
        } else {
          r.bossShieldTimer = 2.0;
          engine.addShockwave(r.x, r.y, 110, 'rgba(72, 219, 251, 0.8)');
          engine.addFloatingText(r.x, r.y - r.radius - 14, '🛡️ TITAN AEGIS!', '#48dbfb', 15);
        }
        r.abilityTimer = ROCK_VARIANTS.milestoneBoss.abilityInterval;
      } else if (r.isBoss) {
        r.vx = (r.vx > 0 ? 1 : -1) * 145;
        r.vy = -320;
        engine.addShockwave(r.x, r.y, 105, 'rgba(217, 128, 250, 0.7)');
        r.abilityTimer = ROCK_VARIANTS.boss.abilityInterval;
      }
    }
  }

  // --- Module: src/core/GameEngine.js ---
  /**
   * GameEngine - Central Simulation Coordinator
   */
  class GameEngine {
    constructor({ bus, saveManager, achievementTracker }) {
      this.bus = bus;
      this.saveManager = saveManager;
      this.achievementTracker = achievementTracker;
  
      this.width = 400;
      this.height = 700;
      this.groundY = 600;
  
      this.gameState = 'LOBBY';
      this.gameMode = 'STANDARD'; // 'STANDARD' | 'BOSS_RUSH'
      this.score = 0;
      this.runCoins = 0;
      this.usedRevive = false;
      this.invulnerableTimer = 0;
      this.intermissionLockTimer = 0;
      this.shakeTimer = 0;
      this.shakeIntensity = 0;
  
      // Combo & Ultimate Skill State
      this.comboCount = 0;
      this.comboTimer = 0;
      this.ultimateCharge = 0;
      this.ultimateBeamTimer = 0;
  
      this.activePowerups = {
        rapidFire: 0,
        shield: 0,
        magnet: 0,
        freeze: 0,
      };
  
      this.cannon = new Cannon(200, 600);
      this.waveSystem = new WaveSystem(bus);
      this.physicsSystem = new PhysicsSystem(bus);
      this.combatSystem = new CombatSystem(bus);
  
      // Active entity lists
      this.bullets = [];
      this.rocks = [];
      this.coins = [];
      this.powerups = [];
      this.particles = [];
      this.shockwaves = [];
      this.floatingTexts = [];
  
      // Object Pools for high-frequency objects
      this.bulletPool = new ObjectPool(() => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 5.5,
        overdrive: false,
        isDrone: false,
        damageRatio: 1.0,
      }));
  
      this.particlePool = new ObjectPool(() => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        r: 3,
        color: '#fff',
        life: 1,
        decay: 2,
      }));
  
      this.textPool = new ObjectPool(() => ({
        x: 0,
        y: 0,
        text: '',
        color: '#ffcf33',
        size: 16,
        vy: -55,
        life: 1,
      }));
    }
  
    setViewport(width, height) {
      this.width = width;
      this.height = height;
      const groundH =
        this.gameState === 'LOBBY' ? PHYSICS.LOBBY_GROUND_HEIGHT : PHYSICS.GROUND_HEIGHT;
      this.groundY = height - groundH;
      this.cannon.setBounds(width, this.groundY);
    }
  
    // --- Computed Stats ---
    getFireRateShotsPerSec() {
      return getFireRateShotsPerSec(
        this.saveManager.state.upgrades.fireRate,
        this.activePowerups.rapidFire > 0
      );
    }
  
    getBarrelCount() {
      return getBarrelCount(this.saveManager.state.upgrades.fireRate);
    }
  
    getDroneCount() {
      const save = this.saveManager.state;
      return getDroneCount(save.stats.highestWave, save.upgrades.firePower);
    }
  
    getBulletDamage() {
      return getBulletDamage(this.saveManager.state.upgrades.firePower);
    }
  
    getCoinMultiplier() {
      return getCoinMultiplier(
        this.saveManager.state.upgrades.coinValue,
        this.activePowerups.magnet > 0,
        this.gameMode === 'BOSS_RUSH'
      );
    }
  
    isBossRushUnlocked() {
      return this.saveManager.state.stats.highestWave >= 6;
    }
  
    toggleGameMode() {
      if (!this.isBossRushUnlocked()) return false;
      this.gameMode = this.gameMode === 'STANDARD' ? 'BOSS_RUSH' : 'STANDARD';
      this.setupCurrentWave();
      this.bus.emit('mode:changed', this.gameMode);
      return true;
    }
  
    addUltimateCharge(amount) {
      const prev = this.ultimateCharge;
      this.ultimateCharge = Math.min(100, this.ultimateCharge + amount);
      if (this.ultimateCharge !== prev) {
        this.bus.emit('ultimate:updated', this.ultimateCharge);
      }
    }
  
    activateUltimate() {
      return this.combatSystem.triggerUltimate(this);
    }
  
    // --- VFX & Drop Spawners ---
    spawnParticle(props) {
      this.particles.push(this.particlePool.acquire(props));
    }
  
    addParticles(x, y, color, count = 12, speed = 180) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = (0.25 + Math.random() * 0.85) * speed;
        this.spawnParticle({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 40,
          r: 2.5 + Math.random() * 4.5,
          color,
          life: 1,
          decay: 1.6 + Math.random() * 1.4,
        });
      }
    }
  
    addShockwave(x, y, maxRadius, color) {
      this.shockwaves.push({
        x,
        y,
        radius: 10,
        maxRadius,
        color,
        life: 1,
      });
    }
  
    addFloatingText(x, y, text, color = '#ffcf33', size = 16) {
      this.floatingTexts.push(
        this.textPool.acquire({
          x,
          y,
          text,
          color,
          size,
          vy: -55,
          life: 1,
        })
      );
    }
  
    triggerShake(intensity = 6, duration = 0.18) {
      this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
      this.shakeTimer = Math.max(this.shakeTimer, duration);
    }
  
    maybeSpawnPowerup(x, y, guaranteed = false) {
      if (!guaranteed && Math.random() > POWERUP_DROP_CHANCE) return;
      const types = Object.keys(POWERUP_META);
      const type = types[Math.floor(Math.random() * types.length)];
      this.powerups.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 90,
        vy: -130,
        radius: 15,
        type,
        bobPhase: Math.random() * Math.PI * 2,
        life: 9.5,
      });
    }
  
    activatePowerup(type, x, y) {
      const meta = POWERUP_META[type];
      if (!meta) return;
      this.activePowerups[type] = meta.duration;
      this.saveManager.state.stats.powerupsCollected += 1;
      this.bus.emit('powerup:collected', { type, meta });
      this.addParticles(x, y, meta.color, 18, 220);
      this.addFloatingText(x, y - 16, `${meta.icon} ${meta.label}!`, meta.color, 16);
      this.achievementTracker.checkUnlockables();
      this.saveManager.persist();
      this.bus.emit('powerup:updated', this.activePowerups);
    }
  
    spawnCoinBurst(x, y, count = 3) {
      const wave = this.saveManager.state.wave;
      // Scale coin value with wave progression so upgrades stay affordable at Wave 30+
      const waveScale = 1 + wave * 0.75 + Math.pow(Math.max(0, wave - 10), 1.45) * 0.35;
      const baseValue = Math.max(1, Math.round(waveScale * this.getCoinMultiplier()));
      for (let i = 0; i < count; i++) {
        this.coins.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 14,
          vx: (Math.random() - 0.5) * 180,
          vy: -140 - Math.random() * 140,
          radius: 10,
          value: baseValue,
          spin: Math.random() * Math.PI * 2,
          life: 8.5,
        });
      }
    }
  
    awardCoins(amount, popupX = null, popupY = null) {
      const save = this.saveManager.state;
      save.coins += amount;
      save.stats.totalCoinsEarned += amount;
      this.runCoins += amount;
      this.saveManager.persist();
      this.achievementTracker.checkUnlockables();
  
      this.bus.emit('coins:awarded', { amount, totalCoins: save.coins });
  
      if (popupX !== null && popupY !== null) {
        this.addFloatingText(popupX, popupY, `+${formatNum(amount)} 🪙`, '#ffcf33', 15);
      }
    }
  
    buyUpgrade(type) {
      const save = this.saveManager.state;
      const cost = getUpgradeCost(type, save.upgrades[type]);
      if (save.coins < cost) return false;
  
      save.coins -= cost;
      save.upgrades[type] += 1;
      save.stats.upgradesBought += 1;
      this.saveManager.persist();
  
      this.addParticles(this.cannon.x, this.cannon.y - 26, '#ffcf33', 16, 200);
      this.bus.emit('upgrade:purchased', { type, level: save.upgrades[type] });
      return true;
    }
  
    // --- Run Lifecycle ---
    setupCurrentWave() {
      const save = this.saveManager.state;
      if (save.wave > save.stats.highestWave) {
        save.stats.highestWave = save.wave;
        this.saveManager.persist();
      }
      this.waveSystem.setupWave(
        save.wave,
        this.gameState === 'PLAYING',
        Math.random,
        this.gameMode === 'BOSS_RUSH'
      );
    }
  
    startRun() {
      if (this.gameState !== 'LOBBY' || this.intermissionLockTimer > 0) return;
      this.gameState = 'PLAYING';
      this.saveManager.state.stats.runsPlayed += 1;
      this.saveManager.persist();
      this.setupCurrentWave();
      this.bus.emit('run:started');
      this.bus.emit('ultimate:updated', this.ultimateCharge);
    }
  
    pauseGame() {
      if (this.gameState !== 'PLAYING') return;
      this.gameState = 'PAUSED';
      this.bus.emit('run:paused', {
        wave: this.saveManager.state.wave,
        score: this.score,
        coins: this.saveManager.state.coins,
      });
    }
  
    resumeGame() {
      if (this.gameState !== 'PAUSED') return;
      this.gameState = 'PLAYING';
      this.bus.emit('run:resumed');
    }
  
    onWaveComplete() {
      const save = this.saveManager.state;
      const clearedWave = save.wave;
      const isMilestone = clearedWave % 10 === 0;
      const waveBonusScale = 25 + clearedWave * 22 + Math.pow(Math.max(0, clearedWave - 10), 1.5) * 6;
      const waveBonus = Math.round(
        waveBonusScale * (isMilestone ? 2.5 : 1) * this.getCoinMultiplier()
      );
  
      // Auto-collect any remaining coins and power-ups on the field
      for (const c of this.coins) {
        this.awardCoins(c.value, c.x, c.y - 10);
      }
      this.coins = [];
  
      for (const p of this.powerups) {
        this.activatePowerup(p.type, p.x, p.y);
      }
      this.powerups = [];
  
      this.bullets.forEach((b) => this.bulletPool.release(b));
      this.bullets = [];
  
      save.wave += 1;
      if (save.wave > save.stats.highestWave) {
        save.stats.highestWave = save.wave;
      }
      this.awardCoins(waveBonus);
  
      // Pause between waves in LOBBY state so the player gets a breather & can buy upgrades
      this.gameState = 'LOBBY';
      this.intermissionLockTimer = 0.55;
  
      this.bus.emit('wave:cleared', {
        clearedWave,
        nextWave: save.wave,
        isMilestone,
        waveBonus,
      });
  
      this.setupCurrentWave();
      this.bus.emit('run:lobby');
    }
  
    triggerGameOver() {
      if (this.gameState === 'GAMEOVER') return;
      this.gameState = 'GAMEOVER';
      this.comboCount = 0;
      this.comboTimer = 0;
      this.bus.emit('combo:updated', { count: 0, multiplier: 1 });
      this.triggerShake(14, 0.35);
      this.addParticles(this.cannon.x, this.cannon.y - 18, '#38b6ff', 28, 280);
  
      this.bus.emit('run:gameover', {
        wave: this.saveManager.state.wave,
        score: this.score,
        runCoins: this.runCoins,
        usedRevive: this.usedRevive,
      });
    }
  
    reviveRun() {
      this.usedRevive = true;
      this.invulnerableTimer = PHYSICS.REVIVE_SHIELD_DURATION;
      this.gameState = 'PLAYING';
  
      this.rocks.forEach((r) => {
        r.vy = -440;
        r.y = Math.min(r.y, this.groundY - 220);
        r.hitScale = 1.3;
        r.hitFlash = 0.6;
      });
  
      this.triggerShake(10, 0.25);
      this.addParticles(this.cannon.x, this.cannon.y - 20, '#48dbfb', 30, 300);
      this.bus.emit('run:revived');
    }
  
    returnToLobby() {
      this.gameState = 'LOBBY';
      this.score = 0;
      this.runCoins = 0;
      this.usedRevive = false;
      this.comboCount = 0;
      this.comboTimer = 0;
      this.ultimateCharge = 0;
      this.ultimateBeamTimer = 0;
      Object.keys(this.activePowerups).forEach((k) => (this.activePowerups[k] = 0));
  
      this.bullets.forEach((b) => this.bulletPool.release(b));
      this.particles.forEach((p) => this.particlePool.release(p));
      this.floatingTexts.forEach((ft) => this.textPool.release(ft));
  
      this.bullets = [];
      this.rocks = [];
      this.powerups = [];
      this.particles = [];
      this.shockwaves = [];
      this.floatingTexts = [];
  
      this.setupCurrentWave();
      this.bus.emit('run:lobby');
      this.bus.emit('combo:updated', { count: 0, multiplier: 1 });
      this.bus.emit('ultimate:updated', this.ultimateCharge);
      this.bus.emit('powerup:updated', this.activePowerups);
    }
  
    // --- Frame Tick ---
    update(dt, inputSystem, isModalOpen = false) {
      if (this.shakeTimer > 0) {
        this.shakeTimer -= dt;
        if (this.shakeTimer <= 0) this.shakeIntensity = 0;
      }
  
      if (this.intermissionLockTimer > 0) {
        this.intermissionLockTimer = Math.max(0, this.intermissionLockTimer - dt);
      }
  
      if (this.ultimateBeamTimer > 0) {
        this.ultimateBeamTimer = Math.max(0, this.ultimateBeamTimer - dt);
      }
  
      if (this.gameState === 'PAUSED' || isModalOpen) {
        return;
      }
  
      if (this.invulnerableTimer > 0) {
        this.invulnerableTimer -= dt;
      }
  
      if (this.gameState === 'PLAYING') {
        // Tick active power-up durations
        let powerupChanged = false;
        for (const key of Object.keys(this.activePowerups)) {
          if (this.activePowerups[key] > 0) {
            this.activePowerups[key] = Math.max(0, this.activePowerups[key] - dt);
            powerupChanged = true;
          }
        }
        if (powerupChanged) {
          this.bus.emit('powerup:updated', this.activePowerups);
        }
  
        // Tick Combo decay timer
        if (this.comboTimer > 0) {
          this.comboTimer -= dt;
          if (this.comboTimer <= 0) {
            this.comboCount = 0;
            this.bus.emit('combo:updated', { count: 0, multiplier: 1 });
          }
        }
      }
  
      const targetGroundH =
        this.gameState === 'LOBBY' ? PHYSICS.LOBBY_GROUND_HEIGHT : PHYSICS.GROUND_HEIGHT;
      const targetGroundY = this.height - targetGroundH;
      if (Math.abs(this.groundY - targetGroundY) > 0.5) {
        this.groundY += (targetGroundY - this.groundY) * Math.min(1, dt * 12);
      } else {
        this.groundY = targetGroundY;
      }
      this.cannon.y = this.groundY;
  
      const keyDir = this.gameState !== 'GAMEOVER' ? inputSystem.getKeyMoveDirection() : 0;
      this.cannon.update(dt, this.width, keyDir);
  
      if (this.gameState === 'PLAYING' && inputSystem.isFiring()) {
        const fireInterval = 1 / this.getFireRateShotsPerSec();
        if (this.cannon.shootCooldown <= 0) {
          this.cannon.shootCooldown = fireInterval;
          this.combatSystem.fireVolley(this);
        }
  
        if (this.cannon.droneCooldown <= 0 && this.getDroneCount() > 0) {
          this.cannon.droneCooldown = COMBAT.DRONE_FIRE_INTERVAL;
          this.combatSystem.fireDrones(this);
        }
      }
  
      if (this.gameState === 'PLAYING') {
        this.waveSystem.update(dt, this.saveManager.state.wave, this.rocks, this.width);
      }
  
      this.combatSystem.updateBullets(dt, this);
      this.physicsSystem.updateRocks(dt, this);
      this.physicsSystem.updatePowerups(dt, this);
      this.physicsSystem.updateCoins(dt, this);
      this.physicsSystem.updateVFX(dt, this);
  
      const activeBoss = this.rocks.find((r) => r.isBoss) || null;
      this.bus.emit('boss:tick', { boss: activeBoss, isPlaying: this.gameState === 'PLAYING' });
    }
  }

  // --- Module: src/render/CanvasRenderer.js ---
  /**
   * CanvasRenderer - Modular 2D Canvas Renderer for Sky, Mountains, Ground,
   * Boulders, Cannon, Projectiles, Power-ups, and VFX.
   */
  class CanvasRenderer {
    constructor(canvas, engine) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.engine = engine;
      this.stars = [];
    }
  
    resize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width;
      const height = rect.height;
  
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  
      this.engine.setViewport(width, height);
      this.initBackdrop(width, height);
    }
  
    initBackdrop(width, height) {
      this.stars = Array.from({ length: 40 }, () => ({
        x: Math.random() * width,
        y: Math.random() * (height * 0.62),
        r: 0.8 + Math.random() * 1.6,
        alpha: 0.25 + Math.random() * 0.65,
        twinkleSpeed: 1 + Math.random() * 2.5,
      }));
    }
  
    render(time) {
      const { ctx, engine } = this;
      const { width, height, groundY, saveManager } = engine;
      const theme = saveManager.getActiveTheme();
      const skin = saveManager.getActiveSkin();
  
      ctx.save();
  
      if (engine.shakeTimer > 0) {
        const sx = (Math.random() - 0.5) * engine.shakeIntensity;
        const sy = (Math.random() - 0.5) * engine.shakeIntensity;
        ctx.translate(sx, sy);
      }
  
      // 1. Sky Gradient Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, theme.skyTop);
      skyGrad.addColorStop(0.55, theme.skyMid);
      skyGrad.addColorStop(1, theme.skyBot);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);
  
      if (engine.activePowerups.freeze > 0) {
        ctx.fillStyle = 'rgba(126, 214, 223, 0.1)';
        ctx.fillRect(0, 0, width, groundY);
      }
  
      // Twinkling Stars
      for (const s of this.stars) {
        const alpha = s.alpha * (0.65 + 0.35 * Math.sin(time * 0.002 * s.twinkleSpeed));
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
  
      // Mountains
      this.drawMountains(theme, width, groundY);
  
      // Shockwaves
      for (const sw of engine.shockwaves) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, sw.life);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
  
      // Coins
      this.drawCoins(engine.coins);
  
      // Power-up Orbs
      this.drawPowerups(engine.powerups);
  
      // Bullets
      this.drawBullets(engine.bullets, skin);
  
      // Orbital Ultimate Beam
      if (engine.ultimateBeamTimer > 0) {
        this.drawUltimateBeam(engine);
      }
  
      // Rocks
      for (const r of engine.rocks) {
        this.drawRock(r, engine.activePowerups.freeze > 0);
      }
  
      // Cannon & Wingman Drones
      this.drawCannon(skin);
  
      // Ground
      this.drawGround(theme, width, height, groundY);
  
      // Particles
      for (const p of engine.particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
  
      // Floating Texts
      for (const ft of engine.floatingTexts) {
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.font = `900 ${ft.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000';
        ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.globalAlpha = 1;
  
      ctx.restore();
    }
  
    drawMountains(theme, width, groundY) {
      const { ctx } = this;
      ctx.fillStyle = theme.mtnBack;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(0, groundY - 120);
      ctx.lineTo(width * 0.28, groundY - 195);
      ctx.lineTo(width * 0.58, groundY - 135);
      ctx.lineTo(width * 0.85, groundY - 210);
      ctx.lineTo(width, groundY - 150);
      ctx.lineTo(width, groundY);
      ctx.closePath();
      ctx.fill();
  
      ctx.fillStyle = theme.mtnFront;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(0, groundY - 85);
      ctx.lineTo(width * 0.18, groundY - 125);
      ctx.lineTo(width * 0.45, groundY - 70);
      ctx.lineTo(width * 0.72, groundY - 135);
      ctx.lineTo(width, groundY - 80);
      ctx.lineTo(width, groundY);
      ctx.closePath();
      ctx.fill();
    }
  
    drawGround(theme, width, height, groundY) {
      const { ctx } = this;
      ctx.fillStyle = theme.grassTop;
      ctx.fillRect(0, groundY, width, 8);
      ctx.fillStyle = theme.grassSub;
      ctx.fillRect(0, groundY + 8, width, 5);
  
      const earthGrad = ctx.createLinearGradient(0, groundY + 13, 0, height);
      earthGrad.addColorStop(0, theme.earthTop);
      earthGrad.addColorStop(1, theme.earthBot);
      ctx.fillStyle = earthGrad;
      ctx.fillRect(0, groundY + 13, width, height - groundY - 13);
    }
  
    drawCoins(coins) {
      const { ctx } = this;
      for (const c of coins) {
        ctx.save();
        ctx.translate(c.x, c.y);
        const scaleX = Math.max(0.25, Math.abs(Math.cos(c.spin)));
        ctx.scale(scaleX, 1);
  
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffcf33';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff3b0';
        ctx.stroke();
  
        ctx.fillStyle = '#d49b00';
        ctx.font = '900 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0.5);
        ctx.restore();
      }
    }
  
    drawPowerups(powerups) {
      const { ctx } = this;
      for (const p of powerups) {
        const meta = POWERUP_META[p.type];
        if (!meta) continue;
        ctx.save();
        ctx.translate(p.x, p.y + Math.sin(p.bobPhase) * 3);
  
        ctx.beginPath();
        ctx.arc(0, 0, p.radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${meta.color}33`;
        ctx.fill();
  
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#141b33';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = meta.color;
        ctx.stroke();
  
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(meta.icon, 0, 1);
        ctx.restore();
      }
    }
  
    drawBullets(bullets, skin) {
      const { ctx } = this;
      for (const b of bullets) {
        ctx.save();
        if (b.isDrone) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#00d2d3';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          ctx.restore();
          continue;
        }
  
        const grad = ctx.createLinearGradient(b.x, b.y - 10, b.x, b.y + 10);
        if (b.overdrive) {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.4, '#48dbfb');
          grad.addColorStop(1, '#0abde3');
        } else {
          grad.addColorStop(0, skin.bulletTop);
          grad.addColorStop(0.4, skin.bulletMid);
          grad.addColorStop(1, skin.bulletBot);
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(b.x - 4, b.y - 10, 8, 18, 4);
        ctx.fill();
        ctx.restore();
      }
    }
  
    drawUltimateBeam(engine) {
      const { ctx } = this;
      const { cannon, ultimateBeamTimer } = engine;
      const alpha = Math.min(1, ultimateBeamTimer * 1.4);
  
      ctx.save();
      ctx.globalAlpha = alpha;
  
      // Wide outer plasma pillar
      const beamGrad = ctx.createLinearGradient(cannon.x - 45, 0, cannon.x + 45, 0);
      beamGrad.addColorStop(0, 'rgba(72, 219, 251, 0)');
      beamGrad.addColorStop(0.25, 'rgba(72, 219, 251, 0.55)');
      beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      beamGrad.addColorStop(0.75, 'rgba(72, 219, 251, 0.55)');
      beamGrad.addColorStop(1, 'rgba(72, 219, 251, 0)');
  
      ctx.fillStyle = beamGrad;
      ctx.fillRect(cannon.x - 45, 0, 90, cannon.y - 36);
  
      ctx.restore();
    }
  
    drawRock(r, isFrozen) {
      const { ctx } = this;
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.scale(r.hitScale, r.hitScale);
  
      const col = getRockColorTier(r.hp);
  
      if (r.bossShieldTimer > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, r.radius + 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(72, 219, 251, 0.22)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#48dbfb';
        ctx.stroke();
      }
  
      ctx.save();
      ctx.rotate(r.angle);
  
      ctx.beginPath();
      r.vertices.forEach((v, idx) => {
        if (idx === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      });
      ctx.closePath();
  
      ctx.fillStyle = r.hitFlash > 0 ? '#ffffff' : col.fill;
      ctx.fill();
  
      const hasArmor = r.variant === 'armored' && !r.armorBroken;
      ctx.lineWidth = hasArmor ? 6 : 3.5;
      ctx.strokeStyle =
        r.hitFlash > 0
          ? '#ffffff'
          : hasArmor
          ? '#dfe4ea'
          : r.variant === 'healer'
          ? '#2ed573'
          : r.variant === 'fast'
          ? '#ff6b6b'
          : isFrozen
          ? '#7ed6df'
          : col.stroke;
      ctx.stroke();
  
      ctx.beginPath();
      r.vertices.forEach((v, idx) => {
        const ix = v.x * 0.68;
        const iy = v.y * 0.68;
        if (idx === 0) ctx.moveTo(ix, iy);
        else ctx.lineTo(ix, iy);
      });
      ctx.closePath();
      ctx.fillStyle = r.hitFlash > 0 ? 'rgba(255,255,255,0.6)' : col.dark;
      ctx.fill();
      ctx.restore();
  
      if (r.isMilestone) {
        ctx.font = '21px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👑', 0, -r.radius - 10);
      } else if (r.isBoss) {
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👑', 0, -r.radius - 8);
      } else if (hasArmor) {
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🛡️', 0, -r.radius - 6);
      } else if (r.variant === 'healer') {
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💚', 0, -r.radius - 6);
      } else if (r.variant === 'fast') {
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☄️', 0, -r.radius - 6);
      }
  
      const label = formatNum(r.hp);
      const fontSize = r.size === 3 ? 24 : r.size === 2 ? 19 : 14;
      ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
  
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillText(label, 0, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, 0, 0);
  
      ctx.restore();
    }
  
    drawCannon(skin) {
      const { ctx, engine } = this;
      const { cannon, invulnerableTimer, activePowerups } = engine;
  
      ctx.save();
      ctx.translate(cannon.x, cannon.y);
  
      if (invulnerableTimer > 0 || activePowerups.shield > 0) {
        const isPowerShield = activePowerups.shield > 0;
        const pulse = 0.7 + 0.3 * Math.sin(performance.now() * 0.015);
        ctx.beginPath();
        ctx.arc(0, -24, 42, 0, Math.PI * 2);
        ctx.fillStyle = isPowerShield
          ? `rgba(46, 213, 115, ${0.2 * pulse})`
          : `rgba(72, 219, 251, ${0.18 * pulse})`;
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isPowerShield
          ? `rgba(46, 213, 115, ${0.85 * pulse})`
          : `rgba(72, 219, 251, ${0.8 * pulse})`;
        ctx.stroke();
      }
  
      if (cannon.muzzleFlash > 0) {
        ctx.save();
        ctx.globalAlpha = cannon.muzzleFlash;
        ctx.fillStyle = activePowerups.rapidFire > 0 ? '#48dbfb' : '#fffa65';
        ctx.beginPath();
        ctx.arc(0, -52 + cannon.recoil, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
  
      const barrels = engine.getBarrelCount();
      const barrelWidth = barrels >= 3 ? 11 : 14;
      const spacing = 10;
      const totalSpan = (barrels - 1) * spacing;
  
      for (let i = 0; i < barrels; i++) {
        const bx = -totalSpan / 2 + i * spacing - barrelWidth / 2;
        const by = -48 + cannon.recoil;
  
        const bGrad = ctx.createLinearGradient(bx, by, bx + barrelWidth, by);
        bGrad.addColorStop(0, '#576574');
        bGrad.addColorStop(0.5, skin.barrelMid);
        bGrad.addColorStop(1, '#222f3e');
  
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.roundRect(bx, by, barrelWidth, 30, 4);
        ctx.fill();
  
        ctx.fillStyle = skin.rim;
        ctx.fillRect(bx - 1, by, barrelWidth + 2, 5);
      }
  
      const bodyGrad = ctx.createLinearGradient(-18, -32, 18, -8);
      bodyGrad.addColorStop(0, skin.bodyTop);
      bodyGrad.addColorStop(1, skin.bodyBot);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(-20, -30 + cannon.recoil * 0.4, 40, 22, 9);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = skin.stroke;
      ctx.stroke();
  
      this.drawWheel(-17, -11, 11, cannon.wheelAngle, skin.wheelRim);
      this.drawWheel(17, -11, 11, cannon.wheelAngle, skin.wheelRim);
  
      // Wingman Helper Drones
      const droneCount = engine.getDroneCount();
      if (droneCount > 0) {
        const bobY = Math.sin(cannon.droneBobPhase) * 4;
        this.drawDrone(-44, -34 + bobY, skin);
        if (droneCount >= 2) {
          this.drawDrone(44, -34 - bobY, skin);
        }
      }
  
      ctx.restore();
    }
  
    drawDrone(dx, dy, skin) {
      const { ctx } = this;
      ctx.save();
      ctx.translate(dx, dy);
  
      // Thruster flame
      ctx.fillStyle = 'rgba(72, 219, 251, 0.75)';
      ctx.beginPath();
      ctx.arc(0, 9, 4, 0, Math.PI * 2);
      ctx.fill();
  
      // Drone body pod
      ctx.fillStyle = skin.bodyTop;
      ctx.beginPath();
      ctx.roundRect(-9, -7, 18, 14, 5);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = skin.rim;
      ctx.stroke();
  
      // Eye core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
  
      ctx.restore();
    }
  
    drawWheel(wx, wy, radius, angle, rimColor) {
      const { ctx } = this;
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(angle);
  
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#1e272e';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = rimColor;
      ctx.stroke();
  
      ctx.strokeStyle = '#d2dae2';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * -radius * 0.75, Math.sin(a) * -radius * 0.75);
        ctx.lineTo(Math.cos(a) * radius * 0.75, Math.sin(a) * radius * 0.75);
        ctx.stroke();
      }
  
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = rimColor;
      ctx.fill();
  
      ctx.restore();
    }
  }

  // --- Module: src/services/AudioService.js ---
  /**
   * AudioService - Zero-asset Web Audio API synthesizer for SFX and procedural synthwave music.
   * Subscribes to EventBus events.
   */
  class AudioService {
    constructor(bus, engine) {
      this.bus = bus;
      this.engine = engine;
      this.ctx = null;
      this.sfxVolume = 0.8;
      this.musicVolume = 0.45;
      this.lastShootTime = 0;
      this.lastHitTime = 0;
      this.musicTimer = null;
      this.musicStep = 0;
  
      this.bindEvents();
    }
  
    bindEvents() {
      this.bus.on('sfx:shoot', ({ overdrive } = {}) => this.playShoot(overdrive));
      this.bus.on('sfx:hit', ({ hpRatio, armored } = {}) => this.playHit(hpRatio, armored));
      this.bus.on('sfx:coin', () => this.playCoin());
      this.bus.on('sfx:ultimate', () => this.playUltimate());
      this.bus.on('rock:destroyed', ({ size } = {}) => this.playSplit(size));
      this.bus.on('powerup:collected', () => this.playPowerup());
      this.bus.on('achievement:unlocked', () => this.playPowerup());
      this.bus.on('upgrade:purchased', () => this.playUpgrade());
      this.bus.on('run:revived', () => this.playUpgrade());
      this.bus.on('wave:cleared', () => this.playWaveClear());
      this.bus.on('wave:milestoneAlert', () => this.playBossAlert());
      this.bus.on('boss:spawned', () => this.playBossAlert());
      this.bus.on('run:gameover', () => this.playGameOver());
    }
  
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.startMusicLoop();
    }
  
    setVolumes(sfxVol, musicVol) {
      this.sfxVolume = Math.max(0, Math.min(1, sfxVol));
      this.musicVolume = Math.max(0, Math.min(1, musicVol));
    }
  
    startMusicLoop() {
      if (this.musicTimer) return;
      const scale = [130.81, 164.81, 196.0, 220.0, 261.63, 196.0, 164.81, 146.83];
      this.musicTimer = setInterval(() => {
        if (!this.ctx || this.ctx.state !== 'running' || this.musicVolume <= 0.01) return;
        if (!this.engine || this.engine.gameState !== 'PLAYING') return;
  
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const note = scale[this.musicStep % scale.length];
        this.musicStep++;
  
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, t);
  
        const vol = 0.035 * this.musicVolume;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.19);
  
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      }, 220);
    }
  
    playShoot(isOverdrive = false) {
      if (this.sfxVolume <= 0.01 || !this.ctx) return;
      const now = performance.now();
      if (now - this.lastShootTime < 42) return;
      this.lastShootTime = now;
  
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isOverdrive ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(isOverdrive ? 680 : 520, t);
      osc.frequency.exponentialRampToValueAtTime(170, t + 0.045);
  
      gain.gain.setValueAtTime(0.08 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
  
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  
    playHit(hpRatio = 0.5, armored = false) {
      if (this.sfxVolume <= 0.01 || !this.ctx) return;
      const now = performance.now();
      if (now - this.lastHitTime < 35) return;
      this.lastHitTime = now;
  
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = armored ? 'square' : 'sine';
      const baseFreq = armored ? 820 : 220 + (1 - Math.min(1, hpRatio)) * 380;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.72, t + 0.04);
  
      gain.gain.setValueAtTime(0.065 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.045);
    }
  
    playSplit(size = 2) {
      if (this.sfxVolume <= 0.01 || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const startFreq = size === 1 ? 360 : 180;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 0.14);
  
      gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
  
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  
    playCoin() {
      if (this.sfxVolume <= 0.01 || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, t);
      osc.frequency.setValueAtTime(1318.51, t + 0.05);
  
      gain.gain.setValueAtTime(0.09 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.19);
    }
  
    playPowerup() {
      if (this.sfxVolume <= 0.01 || !this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.045);
        gain.gain.setValueAtTime(0.11 * this.sfxVolume, t + i * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.045 + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.045);
        osc.stop(t + i * 0.045 + 0.15);
      });
    }
  
    playUpgrade() {
      if (this.sfxVolume <= 0.01 || !this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.055);
        gain.gain.setValueAtTime(0.11 * this.sfxVolume, t + i * 0.055);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.055 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.055);
        osc.stop(t + i * 0.055 + 0.16);
      });
    }
  
    playWaveClear() {
      if (this.sfxVolume <= 0.01 || !this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        gain.gain.setValueAtTime(0.13 * this.sfxVolume, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.26);
      });
    }
  
    playBossAlert() {
      if (this.sfxVolume <= 0.01 || !this.ctx) return;
      const t = this.ctx.currentTime;
      [140, 110].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + i * 0.18);
        gain.gain.setValueAtTime(0.14 * this.sfxVolume, t + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.18);
        osc.stop(t + i * 0.18 + 0.24);
      });
    }
  
    playUltimate() {
      if (this.sfxVolume <= 0.01 || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(95, t + 0.55);
  
      gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
  
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    }
  
    playGameOver() {
      if (this.sfxVolume <= 0.01 || !this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [349.23, 311.13, 277.18, 207.65];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + i * 0.1);
        gain.gain.setValueAtTime(0.12 * this.sfxVolume, t + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.24);
      });
    }
  }

  // --- Module: src/services/HapticsService.js ---
  /**
   * HapticsService - Cross-platform mobile haptic feedback.
   * - Android: Uses standard `navigator.vibrate(pattern)`
   * - iPhone / iOS 18+ (Safari / WebKit): Uses the native WebKit `<input type="checkbox" switch>`
   *   Taptic Engine trigger (`label.click()`), since iOS Safari does not implement `navigator.vibrate`.
   */
  class HapticsService {
    constructor(bus, saveManager) {
      this.bus = bus;
      this.saveManager = saveManager;
      this.lastPulseTime = 0;
      this.iosSwitchLabel = null;
  
      this.initIosTapticSwitch();
      this.bindEvents();
    }
  
    initIosTapticSwitch() {
      if (typeof document === 'undefined') return;
      // Hidden iOS 17.4+ / iOS 18+ native switch input that triggers the iPhone Taptic Engine
      const label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText =
        'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
  
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      label.appendChild(input);
  
      document.body.appendChild(label);
      this.iosSwitchLabel = label;
    }
  
    bindEvents() {
      this.bus.on('rock:destroyed', ({ isBoss } = {}) => {
        this.vibrate(isBoss ? [35, 40, 50] : 12);
      });
      this.bus.on('powerup:collected', () => this.vibrate([20, 30, 20]));
      this.bus.on('achievement:unlocked', () => this.vibrate([30, 50, 40]));
      this.bus.on('upgrade:purchased', () => this.vibrate(20));
      this.bus.on('wave:cleared', () => this.vibrate([25, 40, 25]));
      this.bus.on('wave:milestoneAlert', () => this.vibrate([50, 80, 70]));
      this.bus.on('boss:spawned', () => this.vibrate([40, 40, 60]));
      this.bus.on('run:revived', () => this.vibrate(30));
      this.bus.on('run:gameover', () => this.vibrate([60, 50, 90]));
      this.bus.on('sfx:ultimate', () => this.vibrate([45, 50, 75]));
    }
  
    triggerIosTaptic(pulses = 1) {
      if (!this.iosSwitchLabel) return;
      const now = performance.now();
      // Rate-limit Taptic pulses so rapid rock splits don't saturate the actuator
      if (now - this.lastPulseTime < 55) return;
      this.lastPulseTime = now;
  
      try {
        this.iosSwitchLabel.click();
        if (pulses > 1) {
          setTimeout(() => {
            try {
              this.iosSwitchLabel.click();
            } catch {
              // ignore
            }
          }, 70);
        }
      } catch {
        // ignore
      }
    }
  
    vibrate(pattern = 15) {
      if (!this.saveManager.state.settings.haptics) return;
  
      // 1. Standard Vibration API (Android Chrome / supported browsers)
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate(pattern);
          return;
        } catch {
          // Fallback to iOS Taptic switch below
        }
      }
  
      // 2. iPhone / iOS 18+ Taptic Engine via WebKit switch input
      const isMultiPulse = Array.isArray(pattern) && pattern.length > 1;
      this.triggerIosTaptic(isMultiPulse ? 2 : 1);
    }
  }

  // --- Module: src/ui/HudController.js ---
  /**
   * HudController - Manages Top HUD, Score, Wave Bar, Boss Bar, Power-up Pills,
   * Wave Banners, and Achievement Toasts.
   */
  class HudController {
    constructor(bus, engine) {
      this.bus = bus;
      this.engine = engine;
      this.toastTimeout = null;
      this.bannerTimeout = null;
  
      this.coinCountEl = document.getElementById('coin-count');
      this.coinPillEl = document.getElementById('coin-pill');
      this.currentScoreEl = document.getElementById('current-score');
      this.bestScoreEl = document.getElementById('best-score');
      this.comboPillEl = document.getElementById('combo-pill');
      this.ultBtnEl = document.getElementById('ult-btn');
      this.ultPctEl = document.getElementById('ult-pct');
      this.waveCurrentEl = document.getElementById('wave-current');
      this.waveNextEl = document.getElementById('wave-next');
      this.waveBarFillEl = document.getElementById('wave-bar-fill');
      this.bossHudEl = document.getElementById('boss-hud');
      this.bossHudLabelEl = document.getElementById('boss-hud-label');
      this.bossBarFillEl = document.getElementById('boss-bar-fill');
      this.powerupHudEl = document.getElementById('powerup-hud');
      this.achToastEl = document.getElementById('achievement-toast');
      this.achToastIconEl = document.getElementById('ach-toast-icon');
      this.achToastTitleEl = document.getElementById('ach-toast-title');
      this.startPromptEl = document.getElementById('start-prompt');
      this.startPromptTextEl = document.getElementById('start-prompt-text');
      this.upgradePanelEl = document.getElementById('upgrade-panel');
      this.pauseBtn = document.getElementById('pause-btn');
      this.waveBannerEl = document.getElementById('wave-banner');
      this.waveBannerTextEl = document.getElementById('wave-banner-text');
      this.waveBannerBonusEl = document.getElementById('wave-banner-bonus');
  
      this.bindEvents();
    }
  
    bindEvents() {
      this.bus.on('hud:scoreUpdated', () => this.updateHUD());
      this.bus.on('state:updated', () => this.updateHUD());
      this.bus.on('upgrade:purchased', () => this.updateHUD());
  
      this.bus.on('coins:awarded', () => {
        this.updateHUD();
        this.coinPillEl.classList.remove('bump');
        void this.coinPillEl.offsetWidth;
        this.coinPillEl.classList.add('bump');
      });
  
      this.bus.on('wave:updated', ({ waveNum, damageDealt, totalHP }) => {
        this.updateWaveHUD(waveNum, damageDealt, totalHP);
      });
  
      this.bus.on('wave:milestoneAlert', ({ waveNum }) => {
        this.showWaveBanner(`⚠️ MILESTONE WAVE ${waveNum}`, 'MEGA TITAN BOSS INCOMING!', true);
      });
  
      this.bus.on('wave:cleared', ({ clearedWave, isMilestone, waveBonus }) => {
        this.showWaveBanner(
          isMilestone ? `🏆 MILESTONE ${clearedWave} CONQUERED!` : `WAVE ${clearedWave} CLEARED!`,
          `+${formatNum(waveBonus)} 🪙 BONUS`,
          false
        );
      });
  
      this.bus.on('powerup:updated', (activePowerups) => {
        this.updatePowerupHUD(activePowerups);
      });
  
      this.bus.on('combo:updated', ({ count, multiplier }) => {
        if (!this.comboPillEl) return;
        if (count >= 5) {
          this.comboPillEl.textContent = `🔥 ${count}x COMBO (${multiplier}x)`;
          this.comboPillEl.classList.remove('hidden');
        } else {
          this.comboPillEl.classList.add('hidden');
        }
      });
  
      this.bus.on('ultimate:updated', (charge) => {
        this.updateUltimateHUD(charge);
      });
  
      this.ultBtnEl?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.engine.activateUltimate();
      });
  
      this.bus.on('boss:tick', ({ boss, isPlaying }) => {
        this.updateBossHUD(boss, isPlaying);
      });
  
      this.bus.on('achievement:unlocked', (ach) => {
        this.showAchievementToast(ach);
      });
  
      this.bus.on('run:started', () => {
        this.startPromptEl.classList.add('hidden');
        this.upgradePanelEl.classList.add('hidden');
        this.pauseBtn?.classList.remove('hidden');
        this.ultBtnEl?.classList.remove('hidden');
      });
  
      this.bus.on('run:resumed', () => {
        this.pauseBtn?.classList.remove('hidden');
        this.ultBtnEl?.classList.remove('hidden');
      });
  
      this.bus.on('run:gameover', () => {
        this.pauseBtn?.classList.add('hidden');
        this.ultBtnEl?.classList.add('hidden');
      });
  
      this.bus.on('run:lobby', () => {
        this.updateHUD();
        this.pauseBtn?.classList.add('hidden');
        this.ultBtnEl?.classList.add('hidden');
        if (this.startPromptTextEl) {
          const modePrefix = this.engine.gameMode === 'BOSS_RUSH' ? '👑 BOSS RUSH — ' : '';
          this.startPromptTextEl.textContent = `${modePrefix}DRAG OR USE ◀ ▶ & SPACE — WAVE ${this.engine.saveManager.state.wave}`;
        }
        this.startPromptEl.classList.remove('hidden');
        this.upgradePanelEl.classList.remove('hidden');
      });
    }
  
    updateHUD() {
      const save = this.engine.saveManager.state;
      this.coinCountEl.textContent = formatNum(save.coins);
      this.currentScoreEl.textContent = formatNum(this.engine.score);
      this.bestScoreEl.textContent = `BEST: ${formatNum(save.bestScore)}`;
    }
  
    updateWaveHUD(waveNum, damageDealt, totalHP) {
      this.waveCurrentEl.textContent = waveNum;
      this.waveNextEl.textContent = waveNum + 1;
      this.waveCurrentEl.classList.toggle('milestone', waveNum % 10 === 0);
      this.waveNextEl.classList.toggle('milestone', (waveNum + 1) % 10 === 0);
      const pct = totalHP > 0 ? Math.min(100, (damageDealt / totalHP) * 100) : 0;
      this.waveBarFillEl.style.width = `${pct}%`;
    }
  
    updateBossHUD(activeBoss, isPlaying) {
      if (!activeBoss || !isPlaying) {
        this.bossHudEl.classList.add('hidden');
        return;
      }
      this.bossHudEl.classList.remove('hidden');
      this.bossHudLabelEl.textContent = activeBoss.isMilestone
        ? `👑 TITAN MEGA-BOSS (${formatNum(activeBoss.hp)})`
        : `👑 BOSS BOULDER (${formatNum(activeBoss.hp)})`;
      const pct = Math.max(0, Math.min(100, (activeBoss.hp / activeBoss.maxHp) * 100));
      this.bossBarFillEl.style.width = `${pct}%`;
    }
  
    updatePowerupHUD(activePowerups) {
      const entries = Object.entries(activePowerups).filter(([, t]) => t > 0);
      if (entries.length === 0) {
        this.powerupHudEl.innerHTML = '';
        return;
      }
      this.powerupHudEl.innerHTML = entries
        .map(([type, remaining]) => {
          const meta = POWERUP_META[type];
          return `<div class="powerup-pill" style="border-color:${meta.color}">
            <span>${meta.icon}</span>
            <span>${meta.label}</span>
            <span>${remaining.toFixed(1)}s</span>
          </div>`;
        })
        .join('');
    }
  
    updateUltimateHUD(charge = 0) {
      if (!this.ultBtnEl || !this.ultPctEl) return;
      const pct = Math.floor(charge);
      const isReady = pct >= 100;
      this.ultPctEl.textContent = isReady ? 'READY!' : `${pct}%`;
      this.ultBtnEl.classList.toggle('ready', isReady);
    }
  
    showWaveBanner(title, sub, isBossAlert = false) {
      this.waveBannerTextEl.textContent = title;
      this.waveBannerBonusEl.textContent = sub;
      this.waveBannerEl.classList.toggle('boss-alert', isBossAlert);
      this.waveBannerEl.classList.remove('hidden');
  
      if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
      this.bannerTimeout = setTimeout(() => {
        this.waveBannerEl.classList.add('hidden');
      }, 2000);
    }
  
    showAchievementToast(ach) {
      this.achToastIconEl.textContent = ach.icon;
      this.achToastTitleEl.textContent = `${ach.name} (+${ach.reward} 🪙)`;
      this.achToastEl.classList.remove('hidden');
      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.achToastEl.classList.add('hidden');
      }, 3200);
    }
  }

  // --- Module: src/ui/ModalController.js ---
  /**
   * ModalController - Manages Upgrade Cards, Hangar/Themes Modal, Stats/Achievements Modal,
   * Settings Modal, Offline Earnings Modal, and Game Over Modal.
   */
  class ModalController {
    constructor({ bus, engine, audioService, hapticsService, inputSystem }) {
      this.bus = bus;
      this.engine = engine;
      this.audioService = audioService;
      this.hapticsService = hapticsService;
      this.inputSystem = inputSystem;
  
      this.gameoverModalEl = document.getElementById('gameover-modal');
      this.goTitleEl = document.getElementById('go-title');
      this.goScoreEl = document.getElementById('go-score');
      this.goCoinsEl = document.getElementById('go-coins');
      this.reviveBtn = document.getElementById('revive-btn');
      this.continueBtn = document.getElementById('continue-btn');
  
      this.pauseModalEl = document.getElementById('pause-modal');
      this.pauseTitleEl = document.getElementById('pause-title');
      this.pauseScoreEl = document.getElementById('pause-score');
      this.pauseCoinsEl = document.getElementById('pause-coins');
      this.pauseBtn = document.getElementById('pause-btn');
      this.resumeBtn = document.getElementById('resume-btn');
      this.pauseLobbyBtn = document.getElementById('pause-lobby-btn');
  
      this.offlineModalEl = document.getElementById('offline-modal');
      this.offlineAmountEl = document.getElementById('offline-amount');
      this.claimOfflineBtn = document.getElementById('claim-offline-btn');
  
      this.skinsModalEl = document.getElementById('skins-modal');
      this.statsModalEl = document.getElementById('stats-modal');
      this.settingsModalEl = document.getElementById('settings-modal');
      this.disclaimerModalEl = document.getElementById('disclaimer-modal');
  
      this.skinsBtn = document.getElementById('skins-btn');
      this.statsBtn = document.getElementById('stats-btn');
      this.settingsBtn = document.getElementById('settings-btn');
      this.modeToggleBtn = document.getElementById('mode-toggle-btn');
      this.openSkinsFooterBtn = document.getElementById('open-skins-footer-btn');
      this.openStatsFooterBtn = document.getElementById('open-stats-footer-btn');
      this.openDisclaimerBtn = document.getElementById('open-disclaimer-btn');
      this.openDisclaimerSettingsBtn = document.getElementById('open-disclaimer-settings-btn');
      this.resetSaveBtn = document.getElementById('reset-save-btn');
  
      this.sfxSlider = document.getElementById('sfx-volume-slider');
      this.musicSlider = document.getElementById('music-volume-slider');
      this.sfxVolValEl = document.getElementById('sfx-vol-val');
      this.musicVolValEl = document.getElementById('music-vol-val');
      this.hapticsToggleBtn = document.getElementById('haptics-toggle-btn');
  
      this.bindEvents();
    }
  
    isAnyModalOpen() {
      return (
        !this.gameoverModalEl.classList.contains('hidden') ||
        (this.pauseModalEl && !this.pauseModalEl.classList.contains('hidden')) ||
        !this.offlineModalEl.classList.contains('hidden') ||
        !this.skinsModalEl.classList.contains('hidden') ||
        !this.statsModalEl.classList.contains('hidden') ||
        !this.settingsModalEl.classList.contains('hidden') ||
        (this.disclaimerModalEl && !this.disclaimerModalEl.classList.contains('hidden'))
      );
    }
  
    bindEvents() {
      this.bus.on('coins:awarded', () => this.updateUpgradeButtons());
      this.bus.on('state:updated', () => this.updateUpgradeButtons());
      this.bus.on('upgrade:purchased', () => this.updateUpgradeButtons());
      this.bus.on('run:lobby', () => this.updateUpgradeButtons());
  
      this.bus.on('wave:cleared', () => {
        // Release drag/key state so player gets a breather before next wave
        this.inputSystem?.reset();
        this.updateUpgradeButtons();
      });
  
      this.bus.on('run:paused', ({ wave, score, coins }) => {
        this.inputSystem?.reset();
        if (this.pauseTitleEl) this.pauseTitleEl.textContent = `WAVE ${wave} PAUSED`;
        if (this.pauseScoreEl) this.pauseScoreEl.textContent = formatNum(score);
        if (this.pauseCoinsEl) this.pauseCoinsEl.textContent = `${formatNum(coins)} 🪙`;
        this.pauseModalEl?.classList.remove('hidden');
      });
  
      this.bus.on('run:resumed', () => {
        this.pauseModalEl?.classList.add('hidden');
      });
  
      this.bus.on('run:gameover', ({ wave, score, runCoins, usedRevive }) => {
        this.inputSystem?.reset();
        this.goTitleEl.textContent = `WAVE ${wave} CRUSHED`;
        this.goScoreEl.textContent = formatNum(score);
        this.goCoinsEl.textContent = `+${formatNum(runCoins)} 🪙`;
        this.reviveBtn.classList.toggle('hidden', usedRevive);
        this.gameoverModalEl.classList.remove('hidden');
      });
  
      this.bus.on('run:revived', () => {
        this.gameoverModalEl.classList.add('hidden');
      });
  
      // Upgrade Card Clicks
      document.querySelectorAll('.upgrade-card').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.audioService.init();
          const type = btn.getAttribute('data-upgrade');
          this.engine.buyUpgrade(type);
        });
      });
  
      // Modal Open Buttons
      const openSkins = () => {
        this.audioService.init();
        this.renderSkinsModal();
        this.skinsModalEl.classList.remove('hidden');
      };
      const openStats = () => {
        this.audioService.init();
        this.engine.achievementTracker.checkUnlockables();
        this.renderStatsModal();
        this.statsModalEl.classList.remove('hidden');
      };
      const openSettings = () => {
        this.audioService.init();
        this.syncSettingsUI();
        this.settingsModalEl.classList.remove('hidden');
      };
  
      const openDisclaimer = (e) => {
        e?.stopPropagation();
        this.settingsModalEl?.classList.add('hidden');
        this.disclaimerModalEl?.classList.remove('hidden');
      };
  
      this.skinsBtn.addEventListener('click', openSkins);
      this.openSkinsFooterBtn.addEventListener('click', openSkins);
      this.statsBtn.addEventListener('click', openStats);
      this.openStatsFooterBtn.addEventListener('click', openStats);
      this.settingsBtn.addEventListener('click', openSettings);
      this.openDisclaimerBtn?.addEventListener('click', openDisclaimer);
      this.openDisclaimerSettingsBtn?.addEventListener('click', openDisclaimer);
  
      this.modeToggleBtn?.addEventListener('click', () => {
        this.audioService.init();
        if (!this.engine.isBossRushUnlocked()) {
          alert('Reach Wave 6 to unlock Boss Rush Mode (2x Coin Multiplier)!');
          return;
        }
        this.engine.toggleGameMode();
        this.audioService.playUpgrade();
        this.updateModeButton();
        this.bus.emit('run:lobby');
      });
  
      this.pauseBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.engine.pauseGame();
      });
  
      this.resumeBtn?.addEventListener('click', () => {
        this.engine.resumeGame();
      });
  
      this.pauseLobbyBtn?.addEventListener('click', () => {
        this.pauseModalEl?.classList.add('hidden');
        this.engine.returnToLobby();
      });
  
      document.querySelectorAll('[data-close]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-close');
          document.getElementById(targetId)?.classList.add('hidden');
        });
      });
  
      this.sfxSlider.addEventListener('input', (e) => {
        this.engine.saveManager.state.settings.sfxVolume = Number(e.target.value);
        this.syncSettingsUI();
        this.engine.saveManager.persist();
      });
  
      this.musicSlider.addEventListener('input', (e) => {
        this.engine.saveManager.state.settings.musicVolume = Number(e.target.value);
        this.syncSettingsUI();
        this.engine.saveManager.persist();
      });
  
      this.hapticsToggleBtn.addEventListener('click', () => {
        const settings = this.engine.saveManager.state.settings;
        settings.haptics = !settings.haptics;
        this.syncSettingsUI();
        if (settings.haptics) this.hapticsService.vibrate(25);
        this.engine.saveManager.persist();
      });
  
      this.reviveBtn.addEventListener('click', () => {
        this.audioService.init();
        this.engine.reviveRun();
      });
  
      this.continueBtn.addEventListener('click', () => {
        this.gameoverModalEl.classList.add('hidden');
        this.engine.returnToLobby();
      });
  
      this.resetSaveBtn.addEventListener('click', () => {
        if (confirm('Reset all coins, waves, upgrades, and achievements?')) {
          this.engine.saveManager.reset();
          this.syncSettingsUI();
          this.engine.returnToLobby();
        }
      });
    }
  
    updateUpgradeButtons() {
      this.updateModeButton();
      const save = this.engine.saveManager.state;
  
      UPGRADE_TYPES.forEach((type) => {
        const card = document.getElementById(`upg-${type}`);
        const statEl = document.getElementById(`stat-${type}`);
        const lvlEl = document.getElementById(`lvl-${type}`);
        const costEl = document.getElementById(`cost-${type}`);
  
        const lvl = save.upgrades[type];
        const cost = getUpgradeCost(type, lvl);
  
        lvlEl.textContent = `Lv. ${lvl}`;
        costEl.textContent = formatNum(cost);
  
        if (type === 'fireRate') {
          statEl.textContent = `${getBaseFireRateShotsPerSec(lvl).toFixed(1)}/s`;
        } else if (type === 'firePower') {
          statEl.textContent = `${formatNum(getBulletDamage(lvl))} DMG`;
        } else if (type === 'coinValue') {
          statEl.textContent = `${Math.round(getBaseCoinMultiplier(lvl) * 100)}%`;
        } else if (type === 'offlineEarnings') {
          statEl.textContent = `${formatNum(getOfflineCoinsPerMinute(lvl))}/m`;
        }
  
        if (save.coins >= cost) {
          card.classList.add('affordable');
          card.classList.remove('locked');
        } else {
          card.classList.remove('affordable');
          card.classList.add('locked');
        }
      });
    }
  
    updateModeButton() {
      if (!this.modeToggleBtn) return;
      if (!this.engine.isBossRushUnlocked()) {
        this.modeToggleBtn.textContent = '🔒 Boss Rush (Wave 6)';
        return;
      }
      this.modeToggleBtn.textContent =
        this.engine.gameMode === 'BOSS_RUSH'
          ? '👑 Mode: Boss Rush (2x 🪙)'
          : '🌊 Mode: Standard';
    }
  
    renderSkinsModal() {
      const save = this.engine.saveManager.state;
      const skinsListEl = document.getElementById('cannon-skins-list');
      const themesListEl = document.getElementById('arena-themes-list');
  
      skinsListEl.innerHTML = CANNON_SKINS.map((sk) => {
        const unlocked = sk.isUnlocked(save);
        const selected = save.equipped.skin === sk.id;
        return `<button class="unlock-item ${selected ? 'selected' : ''} ${
          unlocked ? '' : 'locked-skin'
        }" data-skin="${sk.id}">
          <div class="unlock-top">
            <span class="unlock-swatch" style="background:${sk.swatch}"></span>
            <span class="unlock-status">${
              selected ? 'EQUIPPED' : unlocked ? 'UNLOCKED' : '🔒 LOCKED'
            }</span>
          </div>
          <div class="unlock-name">${sk.name}</div>
          <div class="unlock-req">${sk.reqText}</div>
        </button>`;
      }).join('');
  
      themesListEl.innerHTML = ARENA_THEMES.map((th) => {
        const unlocked = th.isUnlocked(save);
        const selected = save.equipped.theme === th.id;
        return `<button class="unlock-item ${selected ? 'selected' : ''} ${
          unlocked ? '' : 'locked-skin'
        }" data-theme="${th.id}">
          <div class="unlock-top">
            <span class="unlock-swatch" style="background:${th.swatch}"></span>
            <span class="unlock-status">${
              selected ? 'ACTIVE' : unlocked ? 'UNLOCKED' : '🔒 LOCKED'
            }</span>
          </div>
          <div class="unlock-name">${th.name}</div>
          <div class="unlock-req">${th.reqText}</div>
        </button>`;
      }).join('');
  
      skinsListEl.querySelectorAll('[data-skin]').forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-skin');
          const skinObj = CANNON_SKINS.find((s) => s.id === id);
          if (!skinObj || !skinObj.isUnlocked(save)) return;
          save.equipped.skin = id;
          this.engine.saveManager.persist();
          this.audioService.playUpgrade();
          this.renderSkinsModal();
        };
      });
  
      themesListEl.querySelectorAll('[data-theme]').forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-theme');
          const themeObj = ARENA_THEMES.find((t) => t.id === id);
          if (!themeObj || !themeObj.isUnlocked(save)) return;
          save.equipped.theme = id;
          this.engine.saveManager.persist();
          this.audioService.playUpgrade();
          this.renderSkinsModal();
        };
      });
    }
  
    renderStatsModal() {
      const save = this.engine.saveManager.state;
      const statsGridEl = document.getElementById('lifetime-stats-grid');
      const achListEl = document.getElementById('achievements-list');
  
      const statItems = [
        { label: 'BEST SCORE', val: formatNum(save.bestScore) },
        { label: 'HIGHEST WAVE', val: `Wave ${save.stats.highestWave}` },
        { label: 'ROCKS CRUSHED', val: formatNum(save.stats.rocksDestroyed) },
        { label: 'BOSSES SLAIN', val: formatNum(save.stats.bossesDefeated) },
        { label: 'LIFETIME COINS', val: `${formatNum(save.stats.totalCoinsEarned)} 🪙` },
        { label: 'POWER-UPS USED', val: formatNum(save.stats.powerupsCollected) },
      ];
  
      statsGridEl.innerHTML = statItems
        .map(
          (st) => `<div class="stat-mini-card">
            <span class="stat-mini-label">${st.label}</span>
            <span class="stat-mini-val">${st.val}</span>
          </div>`
        )
        .join('');
  
      achListEl.innerHTML = ACHIEVEMENTS.map((ach) => {
        const unlocked = save.unlockedAchievements.includes(ach.id);
        const [cur, target] = ach.progress(save);
        const pct = Math.min(100, Math.round((cur / target) * 100));
        return `<div class="ach-card ${unlocked ? 'unlocked' : ''}">
          <div class="ach-icon">${ach.icon}</div>
          <div class="ach-info">
            <div class="ach-title-row">
              <span class="ach-name">${ach.name}</span>
              <span class="ach-reward">${unlocked ? '✅ CLAIMED' : `+${ach.reward} 🪙`}</span>
            </div>
            <div class="ach-desc">${ach.desc} (${formatNum(Math.min(cur, target))}/${formatNum(
          target
        )})</div>
            <div class="ach-bar">
              <div class="ach-bar-fill" style="width:${pct}%"></div>
            </div>
          </div>
        </div>`;
      }).join('');
    }
  
    syncSettingsUI() {
      const { settings } = this.engine.saveManager.state;
      this.sfxSlider.value = settings.sfxVolume;
      this.musicSlider.value = settings.musicVolume;
      this.sfxVolValEl.textContent = `${settings.sfxVolume}%`;
      this.musicVolValEl.textContent = `${settings.musicVolume}%`;
      this.hapticsToggleBtn.textContent = settings.haptics ? 'ON' : 'OFF';
      this.hapticsToggleBtn.classList.toggle('active', settings.haptics);
      this.audioService.setVolumes(settings.sfxVolume / 100, settings.musicVolume / 100);
    }
  
    checkOfflineEarnings() {
      const earned = this.engine.saveManager.getPendingOfflineReward();
      if (earned > 0) {
        this.offlineAmountEl.textContent = `+${formatNum(earned)} 🪙`;
        this.offlineModalEl.classList.remove('hidden');
        this.claimOfflineBtn.onclick = () => {
          this.audioService.init();
          this.audioService.playCoin();
          this.engine.awardCoins(earned, this.engine.width / 2, this.engine.height / 2);
          this.offlineModalEl.classList.add('hidden');
        };
      }
      this.engine.saveManager.persist();
    }
  }

  // --- Module: src/main.js ---
  /**
   * Boulder Barrage - Application Bootstrap (ES Module Entry Point)
   */
  
  
  
  
  
  
  
  
  
  
  function bootstrap() {
    const canvas = document.getElementById('game-canvas');
    const bus = new EventBus();
    const saveManager = new SaveManager();
    const achievementTracker = new AchievementTracker(saveManager, bus);
  
    const engine = new GameEngine({
      bus,
      saveManager,
      achievementTracker,
    });
  
    const renderer = new CanvasRenderer(canvas, engine);
    const audioService = new AudioService(bus, engine);
    const hapticsService = new HapticsService(bus, saveManager);
    const hudController = new HudController(bus, engine);
  
    let modalController = null;
  
    const inputSystem = new InputSystem(canvas, engine.cannon, {
      getViewportWidth: () => engine.width,
      canInteract: () => engine.gameState !== 'GAMEOVER' && engine.gameState !== 'PAUSED',
      isModalOpen: () => (modalController ? modalController.isAnyModalOpen() : false),
      onActionStart: () => {
        if (engine.gameState === 'LOBBY') {
          audioService.init();
          engine.startRun();
        }
      },
      onTogglePause: () => {
        if (engine.gameState === 'PLAYING') {
          engine.pauseGame();
        } else if (engine.gameState === 'PAUSED') {
          engine.resumeGame();
        }
      },
      onTriggerUltimate: () => {
        engine.activateUltimate();
      },
    });
  
    modalController = new ModalController({
      bus,
      engine,
      audioService,
      hapticsService,
      inputSystem,
    });
  
    window.addEventListener('resize', () => renderer.resize());
  
    // Initialize Viewport, State & UI
    renderer.resize();
    engine.cannon.center(engine.width, engine.groundY);
    modalController.syncSettingsUI();
    engine.setupCurrentWave();
    hudController.updateHUD();
    modalController.updateUpgradeButtons();
    achievementTracker.checkUnlockables();
    modalController.checkOfflineEarnings();
  
    // Main Animation Loop
    let lastTime = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
  
      engine.update(dt, inputSystem, modalController.isAnyModalOpen());
      renderer.render(now);
      requestAnimationFrame(loop);
    }
  
    requestAnimationFrame(loop);
  }
  
  bootstrap();
})();
