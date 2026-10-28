/**
 * Overclock Synergy Definitions
 * Fuses dual compatible power-ups into high-impact Overclock Combos.
 */

export const POWERUP_SYNERGIES = {
  particleBeam: {
    id: 'particleBeam',
    name: 'PARTICLE BEAM STORM',
    icon: '⚡',
    color: '#00d2d3',
    pair: ['rapidFire', 'piercingLaser'],
    desc: 'Hyper-frequency laser array piercing entire boulder columns!',
  },
  shatterfrost: {
    id: 'shatterfrost',
    name: 'SHATTERFROST NOVA',
    icon: '❄️',
    color: '#54a0ff',
    pair: ['freeze', 'explosiveRounds'],
    desc: 'Shattered frozen boulders release piercing frost shrapnel!',
  },
  meteorFlak: {
    id: 'meteorFlak',
    name: 'METEOR FLAK',
    icon: '☄️',
    color: '#ff9f43',
    pair: ['spreadShot', 'giantBullets'],
    desc: 'Massive kinetic cannonballs detonating AoE impact shockwaves!',
  },
  vortexAegis: {
    id: 'vortexAegis',
    name: 'VORTEX AEGIS',
    icon: '🌀',
    color: '#5f27cd',
    pair: ['shield', 'magnet'],
    desc: 'Protective force field pulls coins and deflects boulders with arcs!',
  },
};

export function getActiveSynergies(activePowerups) {
  if (!activePowerups) return [];
  const active = [];
  for (const syn of Object.values(POWERUP_SYNERGIES)) {
    const [p1, p2] = syn.pair;
    if (activePowerups[p1] > 0 && activePowerups[p2] > 0) {
      active.push(syn);
    }
  }
  return active;
}
