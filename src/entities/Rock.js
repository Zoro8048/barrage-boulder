/**
 * Rock Entity Factory & Polygon Vertex Builder
 */

import { ROCK_RADII } from '../config/constants.js';
import { ROCK_VARIANTS } from '../config/rockVariants.js';

export function createRock({
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
