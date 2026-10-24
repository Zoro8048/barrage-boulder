/**
 * HapticsService - Mobile vibration feedback wrapper listening to EventBus events.
 */

export class HapticsService {
  constructor(bus, saveManager) {
    this.bus = bus;
    this.saveManager = saveManager;
    this.bindEvents();
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
  }

  vibrate(pattern = 15) {
    if (!this.saveManager.state.settings.haptics) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore unsupported browser environments
      }
    }
  }
}
