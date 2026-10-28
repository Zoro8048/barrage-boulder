/**
 * Core Matrix - Prestige & Permanent Tech Tree Upgrades
 */

export const PRESTIGE_MIN_WAVE = 25;

export function calculatePrestigeReward(highestWave = 1) {
  if (highestWave < PRESTIGE_MIN_WAVE) return 0;
  return Math.max(1, Math.floor(Math.pow((highestWave - 20) / 4.5, 1.25)));
}

export const TECH_TREE_NODES = [
  {
    id: 'naniteRepair',
    name: 'Nanite Hull Splicer',
    icon: '🛡️',
    cost: 1,
    desc: 'Automatically repairs 1 depleted Hull Shield point every 8 waves cleared.',
  },
  {
    id: 'critShockwave',
    name: 'Resonant Concussion',
    icon: '💥',
    cost: 2,
    desc: 'Critical hits generate kinetic shockwaves damaging all neighboring boulders.',
  },
  {
    id: 'powerupMastery',
    name: 'Temporal Overclock',
    icon: '⏳',
    cost: 2,
    desc: 'Extends duration of all collected power-up drops by +35%.',
  },
  {
    id: 'magneticInduction',
    name: 'Magnetic Induction',
    icon: '🧲',
    cost: 1,
    desc: '+50% base coin vacuum collection radius and +25% coin magnet pull speed.',
  },
  {
    id: 'quantumCapacitors',
    name: 'Quantum Capacitors',
    icon: '⚡',
    cost: 3,
    desc: 'Reduces Cannon Tactical Ability cooldowns by 25%.',
  },
  {
    id: 'supernovaMastery',
    name: 'Supernova Siphon',
    icon: '🌟',
    cost: 3,
    desc: 'Ultimate Supernova beam charges 25% faster from hits and destroys.',
  },
];
