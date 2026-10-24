/**
 * AchievementTracker - Evaluates player progression against ACHIEVEMENTS catalog
 * and emits unlock events via EventBus.
 */

import { ACHIEVEMENTS } from '../config/achievements.js';

export class AchievementTracker {
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
