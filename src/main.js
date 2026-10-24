/**
 * Boulder Barrage - Application Bootstrap (ES Module Entry Point)
 */

import { EventBus } from './core/EventBus.js';
import { SaveManager } from './state/SaveManager.js';
import { AchievementTracker } from './state/AchievementTracker.js';
import { GameEngine } from './core/GameEngine.js';
import { CanvasRenderer } from './render/CanvasRenderer.js';
import { InputSystem } from './systems/InputSystem.js';
import { AudioService } from './services/AudioService.js';
import { HapticsService } from './services/HapticsService.js';
import { HudController } from './ui/HudController.js';
import { ModalController } from './ui/ModalController.js';

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
