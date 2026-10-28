/**
 * HudController - Manages Top HUD, Score, Wave Bar, Boss Bar, Power-up Pills,
 * Wave Banners, and Achievement Toasts.
 */

import { POWERUP_META } from '../config/powerups.js';
import { TACTICAL_AUGMENTS } from '../config/augments.js';
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
    this.comboPillEl = document.getElementById('combo-pill');
    this.waveCurrentEl = document.getElementById('wave-current');
    this.waveNextEl = document.getElementById('wave-next');
    this.waveBarFillEl = document.getElementById('wave-bar-fill');
    this.bossHudEl = document.getElementById('boss-hud');
    this.bossHudLabelEl = document.getElementById('boss-hud-label');
    this.bossBarFillEl = document.getElementById('boss-bar-fill');
    this.powerupHudEl = document.getElementById('powerup-hud');
    this.hullHudEl = document.getElementById('hull-hud');
    this.augmentHudEl = document.getElementById('augment-hud');
    this.achToastEl = document.getElementById('achievement-toast');
    this.achToastIconEl = document.getElementById('ach-toast-icon');
    this.achToastLabelEl = document.getElementById('ach-toast-label');
    this.achToastTitleEl = document.getElementById('ach-toast-title');
    this.hangarNotifDotEl = document.getElementById('hangar-notif-dot');
    this.startPromptEl = document.getElementById('start-prompt');
    this.startPromptWaveEl = document.getElementById('start-prompt-wave');
    this.wavePrevBtn = document.getElementById('wave-prev-btn');
    this.waveNextBtn = document.getElementById('wave-next-btn');
    this.startPromptTextEl = document.getElementById('start-prompt-text');
    this.lobbyModeWrapEl = document.getElementById('lobby-mode-wrap');
    this.lobbyLoadoutBtn = document.getElementById('lobby-loadout-btn');
    this.upgradePanelEl = document.getElementById('upgrade-panel');
    this.pauseBtn = document.getElementById('pause-btn');
    this.cleanHudBtn = document.getElementById('clean-hud-btn');
    this.hudEl = document.getElementById('hud');
    this.hudMiddleZoneEl = document.getElementById('hud-middle-zone');
    this.waveBannerEl = document.getElementById('wave-banner');
    this.waveBannerTextEl = document.getElementById('wave-banner-text');
    this.waveBannerBonusEl = document.getElementById('wave-banner-bonus');

    this.abilityBtn = document.getElementById('ability-btn');
    this.abilityCooldownFillEl = document.getElementById('ability-cooldown-fill');
    this.abilityNameEl = document.getElementById('ability-name');
    this.abilityIconEl = document.getElementById('ability-icon');

    this.endlessTimerEl = document.getElementById('endless-timer');
    this.synergyBannerEl = document.getElementById('synergy-banner');
    this.synergyBannerTitleEl = document.getElementById('synergy-banner-title');
    this.synergyBannerDescEl = document.getElementById('synergy-banner-desc');
    this.synergyBannerIconEl = document.getElementById('synergy-banner-icon');
    this.synergyTimeout = null;

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

    this.bus.on('ui:banner', ({ title, sub, isAlert }) => {
      this.showWaveBanner(title, sub, Boolean(isAlert));
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

    this.bus.on('hull:updated', ({ hull, maxHull }) => {
      this.updateHullHUD(hull, maxHull);
    });

    this.bus.on('augment:updated', (activeAugments) => {
      this.updateAugmentHUD(activeAugments);
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

    this.bus.on('boss:tick', ({ boss, isPlaying }) => {
      this.updateBossHUD(boss, isPlaying);
    });

    this.bus.on('achievement:unlocked', (ach) => {
      this.showAchievementToast(ach);
    });

    this.bus.on('gear:unlocked', (gear) => {
      this.updateHUD();
      this.showGearToast(gear);
    });

    this.wavePrevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.engine.selectWave(-1);
    });

    this.cleanHudBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleCleanHud();
    });

    this.abilityBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.engine.triggerCannonAbility();
    });

    this.bus.on('ability:tick', (data) => {
      this.updateAbilityUI(data);
    });

    this.bus.on('endless:tick', ({ elapsed }) => {
      this.updateEndlessTimer(elapsed);
    });

    this.bus.on('synergy:activated', (synergy) => {
      this.showSynergyBanner(synergy);
    });

    window.addEventListener('keydown', (e) => {
      const isFocusInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (isFocusInput) return;

      if (e.key === 'h' || e.key === 'H') {
        this.toggleCleanHud();
      } else if (e.code === 'Space' || e.key === ' ') {
        if (this.engine.gameState === 'PLAYING') {
          e.preventDefault();
          this.engine.triggerCannonAbility();
        }
      }
    });

    this.bus.on('settings:cleanHudChanged', () => {
      this.updateCleanHudUI();
    });

    this.waveNextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.engine.selectWave(1);
    });

    this.bus.on('run:started', () => {
      this.hudEl?.classList.add('playing-mode');
      this.startPromptEl.classList.add('hidden');
      this.lobbyModeWrapEl?.classList.add('hidden');
      this.upgradePanelEl.classList.add('hidden');
      this.pauseBtn?.classList.remove('hidden');
      this.hullHudEl?.classList.remove('hidden');
      this.augmentHudEl?.classList.remove('hidden');
      if (this.engine.gameMode === 'ENDLESS') {
        this.endlessTimerEl?.classList.remove('hidden');
      } else {
        this.endlessTimerEl?.classList.add('hidden');
      }
      this.abilityBtn?.classList.remove('hidden');
      this.updateCleanHudUI();
    });

    this.bus.on('run:resumed', () => {
      this.pauseBtn?.classList.remove('hidden');
      this.abilityBtn?.classList.remove('hidden');
      this.updateCleanHudUI();
    });

    this.bus.on('run:gameover', () => {
      this.hudEl?.classList.remove('playing-mode');
      this.pauseBtn?.classList.add('hidden');
      this.lobbyModeWrapEl?.classList.add('hidden');
      this.hullHudEl?.classList.add('hidden');
      this.augmentHudEl?.classList.add('hidden');
      this.abilityBtn?.classList.add('hidden');
      this.endlessTimerEl?.classList.add('hidden');
      this.hudMiddleZoneEl?.classList.remove('hidden-hud');
    });

    this.bus.on('run:lobby', () => {
      this.hudEl?.classList.remove('playing-mode');
      this.updateHUD();
      this.pauseBtn?.classList.add('hidden');
      this.startPromptEl.classList.remove('hidden');
      this.lobbyModeWrapEl?.classList.remove('hidden');
      this.upgradePanelEl.classList.remove('hidden');
      this.hullHudEl?.classList.add('hidden');
      this.augmentHudEl?.classList.add('hidden');
      this.abilityBtn?.classList.add('hidden');
      this.endlessTimerEl?.classList.add('hidden');
      this.hudMiddleZoneEl?.classList.remove('hidden-hud');
      this.updateCleanHudUI();
    });
  }

  updateHUD() {
    const save = this.engine.saveManager.state;
    this.coinCountEl.textContent = formatNum(save.coins);
    this.currentScoreEl.textContent = formatNum(this.engine.score);
    this.bestScoreEl.textContent = `BEST: ${formatNum(save.bestScore)}`;

    if (this.startPromptWaveEl) {
      const isBossRush = this.engine.gameMode === 'BOSS_RUSH';
      this.startPromptWaveEl.textContent = isBossRush
        ? `👑 BOSS RUSH • WAVE ${save.wave}`
        : `WAVE ${save.wave}`;
      this.startPromptWaveEl.classList.toggle('boss-rush', isBossRush);
    }
    if (this.wavePrevBtn) {
      this.wavePrevBtn.classList.toggle('hidden', save.wave <= 1);
    }
    if (this.waveNextBtn) {
      const maxWave = Math.max(1, save.stats.highestWave || save.wave);
      this.waveNextBtn.classList.toggle('hidden', save.wave >= maxWave);
    }
    if (this.lobbyLoadoutBtn) {
      const c = this.engine.saveManager.getActiveCannon();
      const a = this.engine.saveManager.getActiveAddon();
      this.lobbyLoadoutBtn.textContent = `${c.icon} ${c.name} • ${a.icon} ${a.name}`;
    }
    if (this.hangarNotifDotEl) {
      this.hangarNotifDotEl.classList.toggle('hidden', !save.hasUnseenGear);
    }
    if (this.startPromptTextEl) {
      this.startPromptTextEl.textContent = 'DRAG TO AIM & FIRE';
    }
    this.updateCleanHudUI();
  }

  toggleCleanHud() {
    const save = this.engine.saveManager.state;
    if (!save.settings) save.settings = {};
    save.settings.cleanHud = !save.settings.cleanHud;
    this.engine.saveManager.persist();
    this.updateCleanHudUI();
    this.bus.emit('settings:cleanHudChanged', save.settings.cleanHud);
  }

  updateCleanHudUI() {
    const isClean = Boolean(this.engine.saveManager.state.settings?.cleanHud);
    const isPlaying = this.engine.gameState === 'PLAYING';

    this.hudMiddleZoneEl?.classList.toggle('hidden-hud', isClean && isPlaying);
    this.cleanHudBtn?.classList.toggle('active', isClean);
    if (this.cleanHudBtn) {
      this.cleanHudBtn.textContent = isClean ? '🙈' : '👁️';
      this.cleanHudBtn.title = isClean ? 'Show Viewport Info (H)' : 'Clean Viewport / Hide Info (H)';
    }
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
          <span class="powerup-pill-time">${remaining.toFixed(1)}s</span>
        </div>`;
      })
      .join('');
  }

  updateHullHUD(hull, maxHull) {
    if (!this.hullHudEl) return;
    const safeHull = Math.max(0, hull ?? 0);
    const safeMax = Math.max(1, maxHull ?? 3);
    let pips = '';
    for (let i = 0; i < safeMax; i++) {
      const active = i < safeHull;
      const isCritical = safeHull === 1 && active;
      pips += `<span class="hull-pip ${active ? 'active' : 'depleted'} ${isCritical ? 'critical' : ''}" title="Hull Shield ${i + 1}/${safeMax}">🛡️</span>`;
    }
    this.hullHudEl.innerHTML = `
      <div class="hull-badge">
        <span class="hull-label">HULL</span>
        <div class="hull-pips">${pips}</div>
      </div>
    `;
  }

  updateAugmentHUD(activeAugments) {
    if (!this.augmentHudEl) return;
    if (!activeAugments || activeAugments.length === 0) {
      this.augmentHudEl.innerHTML = '';
      return;
    }
    const map = new Map(TACTICAL_AUGMENTS.map((a) => [a.id, a]));
    this.augmentHudEl.innerHTML = activeAugments
      .map((id) => {
        const aug = map.get(id);
        if (!aug) return '';
        return `<div class="aug-chip" title="${aug.name}: ${aug.desc || aug.description}" style="border-color:${aug.color || '#48dbfb'}">
          <span class="aug-chip-icon">${aug.icon}</span>
          <span class="aug-chip-name">${aug.name}</span>
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
    if (this.achToastLabelEl) this.achToastLabelEl.textContent = 'ACHIEVEMENT UNLOCKED!';
    this.achToastIconEl.textContent = ach.icon;
    this.achToastTitleEl.textContent = `${ach.name} (+${ach.reward} 🪙)`;
    this.achToastEl.classList.remove('hidden');
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.achToastEl.classList.add('hidden');
    }, 3200);
  }

  showGearToast({ category, name, icon }) {
    if (this.achToastLabelEl) this.achToastLabelEl.textContent = `🔓 NEW ${category} UNLOCKED!`;
    this.achToastIconEl.textContent = icon || '🎨';
    this.achToastTitleEl.textContent = `${name} (Tap 🎨 Hangar)`;
    this.achToastEl.classList.remove('hidden');
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.achToastEl.classList.add('hidden');
    }, 3400);
  }

  updateAbilityUI({ cooldown, maxCooldown, name, icon, isReady, isPlaying }) {
    if (!this.abilityBtn) return;
    if (!isPlaying) {
      this.abilityBtn.classList.add('hidden');
      return;
    }
    this.abilityBtn.classList.remove('hidden');
    if (this.abilityNameEl) this.abilityNameEl.textContent = name;
    if (this.abilityIconEl) this.abilityIconEl.textContent = icon;
    this.abilityBtn.classList.toggle('ready', isReady);
    this.abilityBtn.classList.toggle('on-cooldown', !isReady);
    const pct = maxCooldown > 0 ? (cooldown / maxCooldown) * 100 : 0;
    if (this.abilityCooldownFillEl) {
      this.abilityCooldownFillEl.style.height = `${pct}%`;
    }
  }

  updateEndlessTimer(elapsed) {
    if (!this.endlessTimerEl) return;
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);
    this.endlessTimerEl.textContent = `⏱️ ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    this.endlessTimerEl.classList.remove('hidden');
  }

  showSynergyBanner(synergy) {
    if (!this.synergyBannerEl) return;
    if (this.synergyBannerTitleEl) this.synergyBannerTitleEl.textContent = 'OVERCLOCK ACTIVATED!';
    if (this.synergyBannerDescEl) this.synergyBannerDescEl.textContent = `${synergy.icon} ${synergy.name}`;
    if (this.synergyBannerIconEl) this.synergyBannerIconEl.textContent = synergy.icon;
    this.synergyBannerEl.classList.remove('hidden');
    if (this.synergyTimeout) clearTimeout(this.synergyTimeout);
    this.synergyTimeout = setTimeout(() => {
      this.synergyBannerEl?.classList.add('hidden');
    }, 2800);
  }
}
