/**
 * AudioService - Zero-asset Web Audio API synthesizer for SFX and procedural synthwave music.
 * Subscribes to EventBus events.
 */

export class AudioService {
  constructor(bus, engine) {
    this.bus = bus;
    this.engine = engine;
    this.ctx = null;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.45;
    this.lastShootTime = 0;
    this.lastHitTime = 0;
    this.musicTimer = null;
    this.musicStep = 0;

    this.bindEvents();
  }

  bindEvents() {
    this.bus.on('sfx:shoot', ({ overdrive } = {}) => this.playShoot(overdrive));
    this.bus.on('sfx:hit', ({ hpRatio, armored } = {}) => this.playHit(hpRatio, armored));
    this.bus.on('sfx:coin', () => this.playCoin());
    this.bus.on('sfx:ultimate', () => this.playUltimate());
    this.bus.on('rock:destroyed', ({ size } = {}) => this.playSplit(size));
    this.bus.on('powerup:collected', () => this.playPowerup());
    this.bus.on('achievement:unlocked', () => this.playPowerup());
    this.bus.on('upgrade:purchased', () => this.playUpgrade());
    this.bus.on('run:revived', () => this.playUpgrade());
    this.bus.on('wave:cleared', () => this.playWaveClear());
    this.bus.on('wave:milestoneAlert', () => this.playBossAlert());
    this.bus.on('boss:spawned', () => this.playBossAlert());
    this.bus.on('run:gameover', () => this.playGameOver());
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.startMusicLoop();
  }

  setVolumes(sfxVol, musicVol) {
    this.sfxVolume = Math.max(0, Math.min(1, sfxVol));
    this.musicVolume = Math.max(0, Math.min(1, musicVol));
  }

  startMusicLoop() {
    if (this.musicTimer) return;
    const scale = [130.81, 164.81, 196.0, 220.0, 261.63, 196.0, 164.81, 146.83];
    this.musicTimer = setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || this.musicVolume <= 0.01) return;
      if (!this.engine || this.engine.gameState !== 'PLAYING') return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const note = scale[this.musicStep % scale.length];
      this.musicStep++;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, t);

      const vol = 0.035 * this.musicVolume;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.19);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    }, 220);
  }

  playShoot(isOverdrive = false) {
    if (this.sfxVolume <= 0.01 || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastShootTime < 42) return;
    this.lastShootTime = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isOverdrive ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isOverdrive ? 680 : 520, t);
    osc.frequency.exponentialRampToValueAtTime(170, t + 0.045);

    gain.gain.setValueAtTime(0.08 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playHit(hpRatio = 0.5, armored = false) {
    if (this.sfxVolume <= 0.01 || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastHitTime < 35) return;
    this.lastHitTime = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = armored ? 'square' : 'sine';
    const baseFreq = armored ? 820 : 220 + (1 - Math.min(1, hpRatio)) * 380;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.72, t + 0.04);

    gain.gain.setValueAtTime(0.065 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  playSplit(size = 2) {
    if (this.sfxVolume <= 0.01 || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    const startFreq = size === 1 ? 360 : 180;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.14);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playCoin() {
    if (this.sfxVolume <= 0.01 || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t);
    osc.frequency.setValueAtTime(1318.51, t + 0.05);

    gain.gain.setValueAtTime(0.09 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  playPowerup() {
    if (this.sfxVolume <= 0.01 || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.045);
      gain.gain.setValueAtTime(0.11 * this.sfxVolume, t + i * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.045 + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.045);
      osc.stop(t + i * 0.045 + 0.15);
    });
  }

  playUpgrade() {
    if (this.sfxVolume <= 0.01 || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.055);
      gain.gain.setValueAtTime(0.11 * this.sfxVolume, t + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.055 + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.055);
      osc.stop(t + i * 0.055 + 0.16);
    });
  }

  playWaveClear() {
    if (this.sfxVolume <= 0.01 || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      gain.gain.setValueAtTime(0.13 * this.sfxVolume, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.26);
    });
  }

  playBossAlert() {
    if (this.sfxVolume <= 0.01 || !this.ctx) return;
    const t = this.ctx.currentTime;
    [140, 110].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + i * 0.18);
      gain.gain.setValueAtTime(0.14 * this.sfxVolume, t + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.18);
      osc.stop(t + i * 0.18 + 0.24);
    });
  }

  playUltimate() {
    if (this.sfxVolume <= 0.01 || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.55);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  playGameOver() {
    if (this.sfxVolume <= 0.01 || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [349.23, 311.13, 277.18, 207.65];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      gain.gain.setValueAtTime(0.12 * this.sfxVolume, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.24);
    });
  }
}
