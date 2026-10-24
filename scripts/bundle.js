/**
 * Zero-dependency ES Module -> IIFE Bundler for Boulder Barrage.
 * Concatenates modular src/ files in topological dependency order into game.js
 * so the game runs seamlessly via both file:// (double-clicking index.html) and HTTP/GitHub Pages,
 * while keeping src/ modular and testable with `node --test`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Ordered module graph from leaves to entry point
const MODULE_ORDER = [
  'src/config/constants.js',
  'src/config/upgrades.js',
  'src/config/skins.js',
  'src/config/themes.js',
  'src/config/cannons.js',
  'src/config/addons.js',
  'src/config/powerups.js',
  'src/config/rockVariants.js',
  'src/config/achievements.js',
  'src/core/EventBus.js',
  'src/core/ObjectPool.js',
  'src/core/utils.js',
  'src/state/UpgradeMath.js',
  'src/state/SaveManager.js',
  'src/state/AchievementTracker.js',
  'src/entities/Cannon.js',
  'src/entities/Rock.js',
  'src/systems/WaveSystem.js',
  'src/systems/InputSystem.js',
  'src/systems/PhysicsSystem.js',
  'src/systems/CombatSystem.js',
  'src/core/GameEngine.js',
  'src/render/CanvasRenderer.js',
  'src/services/AudioService.js',
  'src/services/HapticsService.js',
  'src/ui/HudController.js',
  'src/ui/ModalController.js',
  'src/main.js',
];

function stripImportsAndExports(code, filePath) {
  return code
    // Remove multi-line and single-line ES import statements
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    // Convert `export class/function/const/let` to plain declarations
    .replace(/^\s*export\s+(class|function|const|let|var)\s+/gm, '$1 ')
    .trim();
}

const chunks = [
  '/**',
  ' * Boulder Barrage - Bundled Runtime (Generated from src/ via `npm run build`)',
  ' * Works directly over file://, local HTTP servers, and GitHub Pages.',
  ' */',
  '(() => {',
  '  "use strict";',
];

for (const relPath of MODULE_ORDER) {
  const fullPath = path.join(rootDir, relPath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const transformed = stripImportsAndExports(raw, relPath);
  chunks.push(`\n  // --- Module: ${relPath} ---\n  ${transformed.split('\n').join('\n  ')}`);
}

chunks.push('})();\n');

const outputPath = path.join(rootDir, 'game.js');
fs.writeFileSync(outputPath, chunks.join('\n'), 'utf8');
console.log(`Bundled ${MODULE_ORDER.length} modules -> game.js`);
