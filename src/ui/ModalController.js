/**
 * ModalController - Manages Upgrade Cards, Hangar/Themes Modal, Stats/Achievements Modal,
 * Settings Modal, Offline Earnings Modal, and Game Over Modal.
 */

import { UPGRADE_TYPES } from '../config/upgrades.js';
import { CANNON_SKINS } from '../config/skins.js';
import { ARENA_THEMES } from '../config/themes.js';
import { CANNON_VARIETIES } from '../config/cannons.js';
import { CANNON_ADDONS } from '../config/addons.js';
import { POWERUP_META } from '../config/powerups.js';
import { ACHIEVEMENTS } from '../config/achievements.js';
import {
  getUpgradeCost,
  getBaseFireRateShotsPerSec,
  getBulletDamage,
  getBaseCoinMultiplier,
  getOfflineCoinsPerMinute,
  getNextUpgradeMilestone,
} from '../state/UpgradeMath.js';
import { formatNum } from '../core/utils.js';

export class ModalController {
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
    this.augmentModalEl = document.getElementById('augment-modal');
    this.augmentCardListEl = document.getElementById('augment-card-list');

    this.skinsBtn = document.getElementById('skins-btn');
    this.statsBtn = document.getElementById('stats-btn');
    this.settingsBtn = document.getElementById('settings-btn');
    this.modeToggleBtn = document.getElementById('mode-toggle-btn');
    this.lobbyLoadoutBtn = document.getElementById('lobby-loadout-btn');
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
      (this.augmentModalEl && !this.augmentModalEl.classList.contains('hidden')) ||
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

    this.bus.on('augment:offered', ({ options }) => {
      this.inputSystem?.reset();
      this.renderAugmentOptions(options);
      this.augmentModalEl?.classList.remove('hidden');
    });

    // Upgrade Card Clicks & Press-and-Hold Auto-Upgrade
    let holdTimeout = null;
    let holdInterval = null;
    const stopHoldUpgrade = () => {
      if (holdTimeout) clearTimeout(holdTimeout);
      if (holdInterval) clearInterval(holdInterval);
      holdTimeout = null;
      holdInterval = null;
    };

    document.querySelectorAll('.upgrade-card').forEach((btn) => {
      const type = btn.getAttribute('data-upgrade');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audioService.init();
        this.engine.buyUpgrade(type);
      });
      btn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        stopHoldUpgrade();
        holdTimeout = setTimeout(() => {
          holdInterval = setInterval(() => {
            if (!this.engine.buyUpgrade(type)) {
              stopHoldUpgrade();
            }
          }, 110);
        }, 340);
      });
      btn.addEventListener('pointerup', stopHoldUpgrade);
      btn.addEventListener('pointerleave', stopHoldUpgrade);
      btn.addEventListener('pointercancel', stopHoldUpgrade);
    });

    // Modal Open Buttons
    const openSkins = () => {
      this.audioService.init();
      if (this.engine.saveManager.state.hasUnseenGear) {
        this.engine.saveManager.state.hasUnseenGear = false;
        this.engine.saveManager.persist();
        this.bus.emit('state:updated', this.engine.saveManager.state);
      }
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
    this.lobbyLoadoutBtn?.addEventListener('click', openSkins);
    this.openSkinsFooterBtn?.addEventListener('click', openSkins);
    this.statsBtn.addEventListener('click', openStats);
    this.openStatsFooterBtn?.addEventListener('click', openStats);
    this.settingsBtn.addEventListener('click', openSettings);
    this.openDisclaimerBtn?.addEventListener('click', openDisclaimer);
    this.openDisclaimerSettingsBtn?.addEventListener('click', openDisclaimer);

    // Hangar modal tab switching
    document.querySelectorAll('#hangar-tabs .hangar-tab').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        const targetTab = tabBtn.getAttribute('data-tab');
        document.querySelectorAll('#hangar-tabs .hangar-tab').forEach((b) => {
          b.classList.toggle('active', b === tabBtn);
        });
        document.querySelectorAll('#skins-modal .hangar-pane').forEach((pane) => {
          pane.classList.toggle('hidden', pane.id !== `pane-${targetTab}`);
        });
      });
    });

    this.modeToggleBtn?.addEventListener('click', () => {
      this.audioService.init();
      if (!this.engine.isBossRushUnlocked()) {
        this.bus.emit('ui:banner', {
          title: '🔒 BOSS RUSH LOCKED',
          sub: 'Reach Wave 6 to unlock 2x Coin Boss Rush!',
          isAlert: true,
        });
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

    this.resetConfirmTimeout = null;
    this.resetSaveBtn.addEventListener('click', () => {
      if (!this.resetSaveBtn.classList.contains('confirm-danger')) {
        this.resetSaveBtn.classList.add('confirm-danger');
        this.resetSaveBtn.textContent = '⚠️ Tap Again to Confirm Reset';
        if (this.resetConfirmTimeout) clearTimeout(this.resetConfirmTimeout);
        this.resetConfirmTimeout = setTimeout(() => {
          this.resetSaveBtn.classList.remove('confirm-danger');
          this.resetSaveBtn.textContent = '🗑️ Reset All Progress';
        }, 3500);
        return;
      }
      if (this.resetConfirmTimeout) clearTimeout(this.resetConfirmTimeout);
      this.resetSaveBtn.classList.remove('confirm-danger');
      this.resetSaveBtn.textContent = '🗑️ Reset All Progress';
      this.engine.saveManager.reset();
      this.syncSettingsUI();
      this.settingsModalEl?.classList.add('hidden');
      this.engine.returnToLobby();
      this.bus.emit('ui:banner', {
        title: '🔄 PROGRESS RESET',
        sub: 'All stats, coins & upgrades restored to Wave 1',
        isAlert: false,
      });
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

      const perkEl = document.getElementById(`perk-${type}`);
      if (perkEl) {
        const milestone = getNextUpgradeMilestone(type, lvl);
        perkEl.textContent = milestone.text;
        perkEl.classList.toggle('maxed', milestone.isMax);
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
    const varietiesListEl = document.getElementById('cannon-varieties-list');
    const addonsListEl = document.getElementById('cannon-addons-list');
    const skinsListEl = document.getElementById('cannon-skins-list');
    const themesListEl = document.getElementById('arena-themes-list');

    if (varietiesListEl) {
      varietiesListEl.innerHTML = CANNON_VARIETIES.map((cv) => {
        const unlocked = cv.isUnlocked(save);
        const selected = save.equipped.cannon === cv.id;
        return `<button class="unlock-item ${selected ? 'selected' : ''} ${
          unlocked ? '' : 'locked-skin'
        }" data-cannon="${cv.id}">
          <div class="unlock-top">
            <span style="font-size:18px">${cv.icon}</span>
            <span class="unlock-status">${
              selected ? 'EQUIPPED' : unlocked ? 'UNLOCKED' : '🔒 LOCKED'
            }</span>
          </div>
          <div class="unlock-name">${cv.name}</div>
          <div class="unlock-req">${unlocked ? cv.desc : cv.reqText}</div>
        </button>`;
      }).join('');

      varietiesListEl.querySelectorAll('[data-cannon]').forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-cannon');
          const obj = CANNON_VARIETIES.find((c) => c.id === id);
          if (!obj || !obj.isUnlocked(save)) return;
          save.equipped.cannon = id;
          this.engine.saveManager.persist();
          this.audioService.playUpgrade();
          this.updateUpgradeButtons();
          this.bus.emit('state:updated', save);
          this.renderSkinsModal();
        };
      });
    }

    if (addonsListEl) {
      addonsListEl.innerHTML = CANNON_ADDONS.map((ad) => {
        const unlocked = ad.isUnlocked(save);
        const selected = save.equipped.addon === ad.id;
        return `<button class="unlock-item ${selected ? 'selected' : ''} ${
          unlocked ? '' : 'locked-skin'
        }" data-addon="${ad.id}">
          <div class="unlock-top">
            <span style="font-size:18px">${ad.icon}</span>
            <span class="unlock-status">${
              selected ? 'EQUIPPED' : unlocked ? 'UNLOCKED' : '🔒 LOCKED'
            }</span>
          </div>
          <div class="unlock-name">${ad.name}</div>
          <div class="unlock-req">${unlocked ? ad.desc : ad.reqText}</div>
        </button>`;
      }).join('');

      addonsListEl.querySelectorAll('[data-addon]').forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-addon');
          const obj = CANNON_ADDONS.find((a) => a.id === id);
          if (!obj || !obj.isUnlocked(save)) return;
          save.equipped.addon = id;
          this.engine.saveManager.persist();
          this.audioService.playUpgrade();
          this.bus.emit('state:updated', save);
          this.renderSkinsModal();
        };
      });
    }

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

    const powerupsGuideEl = document.getElementById('powerups-guide-list');
    if (powerupsGuideEl) {
      powerupsGuideEl.innerHTML = Object.values(POWERUP_META)
        .map(
          (meta) => `<div class="codex-card" style="border-color:${meta.color}66">
            <div class="codex-orb" style="border-color:${meta.color}">${meta.icon}</div>
            <div class="codex-body">
              <div class="codex-header">
                <div class="codex-title-group">
                  <span class="codex-name" style="color:${meta.color}">${meta.label}</span>
                  <span class="codex-tag" style="border:1px solid ${meta.color}55">${meta.shortTag}</span>
                </div>
                <span class="codex-duration">${meta.duration}s</span>
              </div>
              <div class="codex-desc">${meta.hudDesc}</div>
            </div>
          </div>`
        )
        .join('');
    }
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

  renderAugmentOptions(options) {
    if (!this.augmentCardListEl) return;
    this.augmentCardListEl.innerHTML = options
      .map(
        (aug) => `
        <div class="augment-card" data-augment-id="${aug.id}" style="--aug-accent: ${aug.color || '#ffcf33'}">
          <div class="augment-card-header">
            <span class="augment-card-icon">${aug.icon}</span>
            <span class="augment-card-badge">TACTICAL AUGMENT</span>
          </div>
          <div class="augment-card-title">${aug.name}</div>
          <div class="augment-card-desc">${aug.desc || aug.description}</div>
          <button type="button" class="action-btn primary augment-select-btn">SELECT PERK</button>
        </div>
      `
      )
      .join('');

    this.augmentCardListEl.querySelectorAll('.augment-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const augId = card.getAttribute('data-augment-id');
        this.audioService.init();
        this.engine.activateAugment(augId);
        this.augmentModalEl?.classList.add('hidden');
      });
    });
  }
}
