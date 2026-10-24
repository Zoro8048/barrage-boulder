/**
 * Unlockable Cannon Add-Ons / Tactical Attachments
 */

export const CANNON_ADDONS = [
  {
    id: 'wingmanDrones',
    icon: '🛸',
    name: 'Wingman Drones',
    desc: 'Hovering pods fire homing plasma bolts',
    reqText: 'Default Add-On',
    isUnlocked: () => true,
  },
  {
    id: 'laserSight',
    icon: '🎯',
    name: 'Holo-Scope Sight',
    desc: '+18% Crit Chance & +0.5x Crit Damage',
    reqText: 'Reach Wave 5',
    isUnlocked: (s) => s.stats.highestWave >= 5,
  },
  {
    id: 'sawBlade',
    icon: '⚙️',
    name: 'Bumper Buzzsaw',
    desc: 'Spinning saw slices & bounces low rocks (2.5s CD)',
    reqText: 'Reach Wave 8',
    isUnlocked: (s) => s.stats.highestWave >= 8,
  },
  {
    id: 'teslaCoil',
    icon: '🌩️',
    name: 'Arc Tesla Pylon',
    desc: 'Zaps boulders with chain lightning every 1.3s',
    reqText: 'Reach Wave 12',
    isUnlocked: (s) => s.stats.highestWave >= 12,
  },
  {
    id: 'cryoCore',
    icon: '❄️',
    name: 'Sub-Zero Bumper',
    desc: 'Floor bounces deal frost DMG & slow rocks',
    reqText: 'Reach Wave 16',
    isUnlocked: (s) => s.stats.highestWave >= 16,
  },
];
