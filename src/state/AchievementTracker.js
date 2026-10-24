/**
 * AchievementTracker - Evaluates player progression against ACHIEVEMENTS catalog
 * and emits unlock events via EventBus.
 */

import { ACHIEVEMENTS } from '../config/achievements.js';
import { CANNON_VARIETIES } from '../config/cannons.js';
import { CANNON_ADDONS } from '../config/addons.js';
import { CANNON_SKINS } from '../config/skins.js';
import { ARENA_THEMES } from '../config/themes.js';

export class AchievementTracker {
  constructor(saveManager, bus) {
    this.saveManager = saveManager;
    this.bus = bus;
  }

  checkUnlockables() {
    const save = this.saveManager.state;
    const newlyUnlocked = [];
    let gearUnlocked = false;

    if (!Array.isArray(save.unlockedGear)) {
      save.unlockedGear = ['cannon:striker', 'addon:wingmanDrones', 'skin:classic', 'theme:midnight'];
    }

    const gearCatalogs = [
      { prefix: 'cannon', label: 'CANNON', items: CANNON_VARIETIES },
      { prefix: 'addon', label: 'ADD-ON', items: CANNON_ADDONS },
      { prefix: 'skin', label: 'SKIN', items: CANNON_SKINS },
      { prefix: 'theme', label: 'ARENA', items: ARENA_THEMES },
    ];

    for (const cat of gearCatalogs) {
      for (const item of cat.items) {
        const key = `${cat.prefix}:${item.id}`;
        if (!save.unlockedGear.includes(key) && item.isUnlocked(save)) {
          save.unlockedGear.push(key);
          save.hasUnseenGear = true;
          gearUnlocked = true;
          if (this.bus) {
            this.bus.emit('gear:unlocked', {
              category: cat.label,
              name: item.name,
              icon: item.icon || '🎨',
            });
          }
        }
      }
    }

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

    if (newlyUnlocked.length > 0 || gearUnlocked) {
      this.saveManager.persist();
      if (this.bus) {
        this.bus.emit('state:updated', save);
      }
    }

    return newlyUnlocked;
  }
}
