/**
 * Power-up Drops Metadata, Short Orb Tags, HUD Descriptions & Durations (8 Power-Up Types)
 */

export const POWERUP_META = {
  rapidFire: {
    id: 'rapidFire',
    icon: '⚡',
    shortTag: '2x SPEED',
    label: 'OVERDRIVE',
    hudDesc: '1.85x Twin Hyper-Tracers',
    color: '#48dbfb',
    duration: 8,
  },
  spreadShot: {
    id: 'spreadShot',
    icon: '🔱',
    shortTag: 'BOUNCE',
    label: 'RICOCHET FAN',
    hudDesc: 'Wall-Bouncing Star Blades',
    color: '#ff9f1a',
    duration: 8.5,
  },
  explosiveRounds: {
    id: 'explosiveRounds',
    icon: '💣',
    shortTag: 'CLUSTER',
    label: 'BLAST SHELLS',
    hudDesc: 'Blast Ring + 3 Shrapnel',
    color: '#ff4757',
    duration: 8,
  },
  piercingLaser: {
    id: 'piercingLaser',
    icon: '🔦',
    shortTag: 'LASER',
    label: 'PIERCE BEAM',
    hudDesc: 'Instant Column Laser Lance',
    color: '#d980fa',
    duration: 7.5,
  },
  giantBullets: {
    id: 'giantBullets',
    icon: '🔥',
    shortTag: 'SAW 2X',
    label: 'SAW CALIBRE',
    hudDesc: '2x DMG Saw + Cracks Armor',
    color: '#ffa502',
    duration: 8,
  },
  shield: {
    id: 'shield',
    icon: '🛡️',
    shortTag: 'SHIELD',
    label: 'PLASMA DOME',
    hudDesc: 'Zaps & Repels Boulders',
    color: '#2ed573',
    duration: 8.5,
  },
  magnet: {
    id: 'magnet',
    icon: '🧲',
    shortTag: '2x COINS',
    label: 'MAGNET VORTEX',
    hudDesc: '1.5x Coins + Vortex Pull',
    color: '#ffcf33',
    duration: 10,
  },
  freeze: {
    id: 'freeze',
    icon: '❄️',
    shortTag: 'FROST',
    label: 'CRYO BLIZZARD',
    hudDesc: '55% Slow + 25% Shatter DMG',
    color: '#7ed6df',
    duration: 7.5,
  },
};

export const POWERUP_DROP_CHANCE = 0.18;
