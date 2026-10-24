/**
 * Power-up Drops Metadata, Short Orb Tags, HUD Descriptions & Durations (8 Power-Up Types)
 */

export const POWERUP_META = {
  rapidFire: {
    id: 'rapidFire',
    icon: '⚡',
    shortTag: '2x SPEED',
    label: 'OVERDRIVE',
    hudDesc: '1.85x Fire Speed',
    color: '#48dbfb',
    duration: 8,
  },
  spreadShot: {
    id: 'spreadShot',
    icon: '🔱',
    shortTag: 'SPREAD',
    label: 'SPREAD FAN',
    hudDesc: '+2 Wide Wing Streams',
    color: '#ff9f1a',
    duration: 8.5,
  },
  explosiveRounds: {
    id: 'explosiveRounds',
    icon: '💣',
    shortTag: 'SPLASH',
    label: 'BLAST SHELLS',
    hudDesc: '50% Area Splash DMG',
    color: '#ff4757',
    duration: 8,
  },
  piercingLaser: {
    id: 'piercingLaser',
    icon: '🔦',
    shortTag: 'PIERCE',
    label: 'PIERCE BEAM',
    hudDesc: 'Shots Pass Thru Rocks',
    color: '#d980fa',
    duration: 7.5,
  },
  giantBullets: {
    id: 'giantBullets',
    icon: '🔥',
    shortTag: '2x DMG',
    label: 'MEGA CALIBRE',
    hudDesc: '2x DMG & Knockback',
    color: '#ffa502',
    duration: 8,
  },
  shield: {
    id: 'shield',
    icon: '🛡️',
    shortTag: 'SHIELD',
    label: 'FORCE SHIELD',
    hudDesc: 'Repels Rock Hits',
    color: '#2ed573',
    duration: 8.5,
  },
  magnet: {
    id: 'magnet',
    icon: '🧲',
    shortTag: '2x COINS',
    label: 'MAGNET 2X',
    hudDesc: '1.5x Coins + Vacuum',
    color: '#ffcf33',
    duration: 10,
  },
  freeze: {
    id: 'freeze',
    icon: '❄️',
    shortTag: 'SLOW',
    label: 'CRYO SLOW',
    hudDesc: 'Slows Rocks by 55%',
    color: '#7ed6df',
    duration: 7.5,
  },
};

export const POWERUP_DROP_CHANCE = 0.18;
