/**
 * Rock Variants & Color Tiers Configuration
 */

export const ROCK_VARIANTS = {
  normal: {
    id: 'normal',
    badge: null,
    minWave: 1,
    hpMultiplier: 1.0,
    bounceMultiplier: 1.0,
    speedMultiplier: 1.0,
    abilityInterval: 0,
  },
  armored: {
    id: 'armored',
    badge: '🛡️',
    minWave: 2,
    hpMultiplier: 1.0,
    bounceMultiplier: 1.0,
    speedMultiplier: 1.0,
    armorDamageScale: 0.6, // 40% damage reduction while HP > 50%
    armorBreakThreshold: 0.5,
    strokeColor: '#dfe4ea',
    abilityInterval: 0,
  },
  fast: {
    id: 'fast',
    badge: '☄️',
    minWave: 3,
    hpMultiplier: 0.78,
    bounceMultiplier: 0.78,
    speedMultiplier: 1.65,
    strokeColor: '#ff6b6b',
    abilityInterval: 0,
  },
  healer: {
    id: 'healer',
    badge: '💚',
    minWave: 4,
    hpMultiplier: 1.0,
    bounceMultiplier: 1.0,
    speedMultiplier: 1.0,
    strokeColor: '#2ed573',
    abilityInterval: 2.5,
    healRadius: 170,
    healFraction: 0.1,
  },
  boss: {
    id: 'boss',
    badge: '👑',
    minWave: 3,
    hpMultiplier: 1.27,
    bounceMultiplier: 1.0,
    speedMultiplier: 1.0,
    abilityInterval: 4.5,
  },
  milestoneBoss: {
    id: 'milestoneBoss',
    badge: '👑',
    minWave: 10,
    hpMultiplier: 1.9,
    bounceMultiplier: 1.0,
    speedMultiplier: 1.0,
    abilityInterval: 4.0,
  },
};

export function getRockColorTier(hp) {
  if (hp <= 5) return { fill: '#2ed573', stroke: '#7bed9f', dark: '#1eae57' };
  if (hp <= 15) return { fill: '#a3cb38', stroke: '#c4e538', dark: '#759622' };
  if (hp <= 35) return { fill: '#ffc312', stroke: '#ffeaa7', dark: '#d69e00' };
  if (hp <= 75) return { fill: '#f79f1f', stroke: '#ffda79', dark: '#c97a0b' };
  if (hp <= 160) return { fill: '#ee5253', stroke: '#ff9ff3', dark: '#b33939' };
  if (hp <= 350) return { fill: '#eb2f06', stroke: '#ff7979', dark: '#9e1c00' };
  return { fill: '#8e44ad', stroke: '#d980fa', dark: '#5f27cd' };
}
