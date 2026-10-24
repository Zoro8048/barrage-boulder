/**
 * HapticsService - Cross-platform mobile haptic feedback.
 * - Android: Uses standard `navigator.vibrate(pattern)`
 * - iPhone / iOS 18+ (Safari / WebKit): Uses the native WebKit `<input type="checkbox" switch>`
 *   Taptic Engine trigger (`label.click()`), since iOS Safari does not implement `navigator.vibrate`.
 */

export class HapticsService {
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
