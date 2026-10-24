/**
 * HudController - Manages Top HUD, Score, Wave Bar, Boss Bar, Power-up Pills,
 * Wave Banners, and Achievement Toasts.
 */

import { POWERUP_META } from '../config/powerups.js';
import { formatNum } from '../core/utils.js';

export class HudController {
  constructor(bus, engine) {
    this.bus = bus;
    this.engine = engine;
    this.toastTimeout = null;
    this.bannerTimeout = null;

    this.coinCountEl = document.getElementById('coin-count');
    this.coinPillEl = document.getElementById('coin-pill');
    this.currentScoreEl = document.getElementById('current-score');
    this.bestScoreEl = document.getElementById('best-score');
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
    this.upgradePanelEl = document.getElementById('upgrade-panel');
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

    this.bus.on('boss:tick', ({ boss, isPlaying }) => {
      this.updateBossHUD(boss, isPlaying);
    });

    this.bus.on('achievement:unlocked', (ach) => {
      this.showAchievementToast(ach);
    });

    this.bus.on('run:started', () => {
      this.startPromptEl.classList.add('hidden');
      this.upgradePanelEl.classList.add('hidden');
    });

    this.bus.on('run:lobby', () => {
      this.updateHUD();
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
