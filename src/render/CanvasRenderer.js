/**
 * CanvasRenderer - Modular 2D Canvas Renderer for Sky, Mountains, Ground,
 * Boulders, Cannon, Projectiles, Power-ups, and VFX.
 */

import { POWERUP_META } from '../config/powerups.js';
import { getRockColorTier } from '../config/rockVariants.js';
import { formatNum } from '../core/utils.js';

export class CanvasRenderer {
  constructor(canvas, engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.engine = engine;
    this.stars = [];
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = rect.width;
    const height = rect.height;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.engine.setViewport(width, height);
    this.initBackdrop(width, height);
  }

  initBackdrop(width, height) {
    this.stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.62),
      r: 0.8 + Math.random() * 1.6,
      alpha: 0.25 + Math.random() * 0.65,
      twinkleSpeed: 1 + Math.random() * 2.5,
    }));
  }

  render(time) {
    const { ctx, engine } = this;
    const { width, height, groundY, saveManager } = engine;
    const theme = saveManager.getActiveTheme();
    const skin = saveManager.getActiveSkin();

    ctx.save();

    if (engine.shakeTimer > 0) {
      const sx = (Math.random() - 0.5) * engine.shakeIntensity;
      const sy = (Math.random() - 0.5) * engine.shakeIntensity;
      ctx.translate(sx, sy);
    }

    // 1. Sky Gradient Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, theme.skyTop);
    skyGrad.addColorStop(0.55, theme.skyMid);
    skyGrad.addColorStop(1, theme.skyBot);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    if (engine.activePowerups.freeze > 0) {
      ctx.fillStyle = 'rgba(126, 214, 223, 0.1)';
      ctx.fillRect(0, 0, width, groundY);
    }

    // Twinkling Stars
    for (const s of this.stars) {
      const alpha = s.alpha * (0.65 + 0.35 * Math.sin(time * 0.002 * s.twinkleSpeed));
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mountains
    this.drawMountains(theme, width, groundY);

    // Shockwaves
    for (const sw of engine.shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sw.life);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Coins
    this.drawCoins(engine.coins);

    // Power-up Orbs
    this.drawPowerups(engine.powerups);

    // Bullets
    this.drawBullets(engine.bullets, skin);

    // Orbital Ultimate Beam
    if (engine.ultimateBeamTimer > 0) {
      this.drawUltimateBeam(engine);
    }

    // Rocks
    for (const r of engine.rocks) {
      this.drawRock(r, engine.activePowerups.freeze > 0);
    }

    // Cannon & Wingman Drones
    this.drawCannon(skin);

    // Ground
    this.drawGround(theme, width, height, groundY);

    // Particles
    for (const p of engine.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Floating Texts
    for (const ft of engine.floatingTexts) {
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.font = `900 ${ft.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  drawMountains(theme, width, groundY) {
    const { ctx } = this;
    ctx.fillStyle = theme.mtnBack;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(0, groundY - 120);
    ctx.lineTo(width * 0.28, groundY - 195);
    ctx.lineTo(width * 0.58, groundY - 135);
    ctx.lineTo(width * 0.85, groundY - 210);
    ctx.lineTo(width, groundY - 150);
    ctx.lineTo(width, groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = theme.mtnFront;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(0, groundY - 85);
    ctx.lineTo(width * 0.18, groundY - 125);
    ctx.lineTo(width * 0.45, groundY - 70);
    ctx.lineTo(width * 0.72, groundY - 135);
    ctx.lineTo(width, groundY - 80);
    ctx.lineTo(width, groundY);
    ctx.closePath();
    ctx.fill();
  }

  drawGround(theme, width, height, groundY) {
    const { ctx } = this;
    ctx.fillStyle = theme.grassTop;
    ctx.fillRect(0, groundY, width, 8);
    ctx.fillStyle = theme.grassSub;
    ctx.fillRect(0, groundY + 8, width, 5);

    const earthGrad = ctx.createLinearGradient(0, groundY + 13, 0, height);
    earthGrad.addColorStop(0, theme.earthTop);
    earthGrad.addColorStop(1, theme.earthBot);
    ctx.fillStyle = earthGrad;
    ctx.fillRect(0, groundY + 13, width, height - groundY - 13);
  }

  drawCoins(coins) {
    const { ctx } = this;
    for (const c of coins) {
      ctx.save();
      ctx.translate(c.x, c.y);
      const scaleX = Math.max(0.25, Math.abs(Math.cos(c.spin)));
      ctx.scale(scaleX, 1);

      ctx.beginPath();
      ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffcf33';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff3b0';
      ctx.stroke();

      ctx.fillStyle = '#d49b00';
      ctx.font = '900 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0.5);
      ctx.restore();
    }
  }

  drawPowerups(powerups) {
    const { ctx } = this;
    for (const p of powerups) {
      const meta = POWERUP_META[p.type];
      if (!meta) continue;
      ctx.save();
      ctx.translate(p.x, p.y + Math.sin(p.bobPhase) * 3);

      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = `${meta.color}33`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#141b33';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = meta.color;
      ctx.stroke();

      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(meta.icon, 0, 1);
      ctx.restore();
    }
  }

  drawBullets(bullets, skin) {
    const { ctx } = this;
    for (const b of bullets) {
      ctx.save();
      if (b.isDrone) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00d2d3';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();
        continue;
      }

      const grad = ctx.createLinearGradient(b.x, b.y - 10, b.x, b.y + 10);
      if (b.overdrive) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#48dbfb');
        grad.addColorStop(1, '#0abde3');
      } else {
        grad.addColorStop(0, skin.bulletTop);
        grad.addColorStop(0.4, skin.bulletMid);
        grad.addColorStop(1, skin.bulletBot);
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(b.x - 4, b.y - 10, 8, 18, 4);
      ctx.fill();
      ctx.restore();
    }
  }

  drawUltimateBeam(engine) {
    const { ctx } = this;
    const { cannon, ultimateBeamTimer } = engine;
    const alpha = Math.min(1, ultimateBeamTimer * 1.4);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Wide outer plasma pillar
    const beamGrad = ctx.createLinearGradient(cannon.x - 45, 0, cannon.x + 45, 0);
    beamGrad.addColorStop(0, 'rgba(72, 219, 251, 0)');
    beamGrad.addColorStop(0.25, 'rgba(72, 219, 251, 0.55)');
    beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    beamGrad.addColorStop(0.75, 'rgba(72, 219, 251, 0.55)');
    beamGrad.addColorStop(1, 'rgba(72, 219, 251, 0)');

    ctx.fillStyle = beamGrad;
    ctx.fillRect(cannon.x - 45, 0, 90, cannon.y - 36);

    ctx.restore();
  }

  drawRock(r, isFrozen) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.scale(r.hitScale, r.hitScale);

    const col = getRockColorTier(r.hp);

    if (r.bossShieldTimer > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, r.radius + 9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(72, 219, 251, 0.22)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#48dbfb';
      ctx.stroke();
    }

    ctx.save();
    ctx.rotate(r.angle);

    ctx.beginPath();
    r.vertices.forEach((v, idx) => {
      if (idx === 0) ctx.moveTo(v.x, v.y);
      else ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();

    ctx.fillStyle = r.hitFlash > 0 ? '#ffffff' : col.fill;
    ctx.fill();

    const hasArmor = r.variant === 'armored' && !r.armorBroken;
    ctx.lineWidth = hasArmor ? 6 : 3.5;
    ctx.strokeStyle =
      r.hitFlash > 0
        ? '#ffffff'
        : hasArmor
        ? '#dfe4ea'
        : r.variant === 'healer'
        ? '#2ed573'
        : r.variant === 'fast'
        ? '#ff6b6b'
        : isFrozen
        ? '#7ed6df'
        : col.stroke;
    ctx.stroke();

    ctx.beginPath();
    r.vertices.forEach((v, idx) => {
      const ix = v.x * 0.68;
      const iy = v.y * 0.68;
      if (idx === 0) ctx.moveTo(ix, iy);
      else ctx.lineTo(ix, iy);
    });
    ctx.closePath();
    ctx.fillStyle = r.hitFlash > 0 ? 'rgba(255,255,255,0.6)' : col.dark;
    ctx.fill();
    ctx.restore();

    if (r.isMilestone) {
      ctx.font = '21px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', 0, -r.radius - 10);
    } else if (r.isBoss) {
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', 0, -r.radius - 8);
    } else if (hasArmor) {
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛡️', 0, -r.radius - 6);
    } else if (r.variant === 'healer') {
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💚', 0, -r.radius - 6);
    } else if (r.variant === 'fast') {
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('☄️', 0, -r.radius - 6);
    }

    const label = formatNum(r.hp);
    const fontSize = r.size === 3 ? 24 : r.size === 2 ? 19 : 14;
    ctx.font = `900 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillText(label, 0, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }

  drawCannon(skin) {
    const { ctx, engine } = this;
    const { cannon, invulnerableTimer, activePowerups } = engine;

    ctx.save();
    ctx.translate(cannon.x, cannon.y);

    if (invulnerableTimer > 0 || activePowerups.shield > 0) {
      const isPowerShield = activePowerups.shield > 0;
      const pulse = 0.7 + 0.3 * Math.sin(performance.now() * 0.015);
      ctx.beginPath();
      ctx.arc(0, -24, 42, 0, Math.PI * 2);
      ctx.fillStyle = isPowerShield
        ? `rgba(46, 213, 115, ${0.2 * pulse})`
        : `rgba(72, 219, 251, ${0.18 * pulse})`;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isPowerShield
        ? `rgba(46, 213, 115, ${0.85 * pulse})`
        : `rgba(72, 219, 251, ${0.8 * pulse})`;
      ctx.stroke();
    }

    if (cannon.muzzleFlash > 0) {
      ctx.save();
      ctx.globalAlpha = cannon.muzzleFlash;
      ctx.fillStyle = activePowerups.rapidFire > 0 ? '#48dbfb' : '#fffa65';
      ctx.beginPath();
      ctx.arc(0, -52 + cannon.recoil, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const barrels = engine.getBarrelCount();
    const barrelWidth = barrels >= 3 ? 11 : 14;
    const spacing = 10;
    const totalSpan = (barrels - 1) * spacing;

    for (let i = 0; i < barrels; i++) {
      const bx = -totalSpan / 2 + i * spacing - barrelWidth / 2;
      const by = -48 + cannon.recoil;

      const bGrad = ctx.createLinearGradient(bx, by, bx + barrelWidth, by);
      bGrad.addColorStop(0, '#576574');
      bGrad.addColorStop(0.5, skin.barrelMid);
      bGrad.addColorStop(1, '#222f3e');

      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, barrelWidth, 30, 4);
      ctx.fill();

      ctx.fillStyle = skin.rim;
      ctx.fillRect(bx - 1, by, barrelWidth + 2, 5);
    }

    const bodyGrad = ctx.createLinearGradient(-18, -32, 18, -8);
    bodyGrad.addColorStop(0, skin.bodyTop);
    bodyGrad.addColorStop(1, skin.bodyBot);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-20, -30 + cannon.recoil * 0.4, 40, 22, 9);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = skin.stroke;
    ctx.stroke();

    this.drawWheel(-17, -11, 11, cannon.wheelAngle, skin.wheelRim);
    this.drawWheel(17, -11, 11, cannon.wheelAngle, skin.wheelRim);

    // Wingman Helper Drones
    const droneCount = engine.getDroneCount();
    if (droneCount > 0) {
      const bobY = Math.sin(cannon.droneBobPhase) * 4;
      this.drawDrone(-44, -34 + bobY, skin);
      if (droneCount >= 2) {
        this.drawDrone(44, -34 - bobY, skin);
      }
    }

    ctx.restore();
  }

  drawDrone(dx, dy, skin) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(dx, dy);

    // Thruster flame
    ctx.fillStyle = 'rgba(72, 219, 251, 0.75)';
    ctx.beginPath();
    ctx.arc(0, 9, 4, 0, Math.PI * 2);
    ctx.fill();

    // Drone body pod
    ctx.fillStyle = skin.bodyTop;
    ctx.beginPath();
    ctx.roundRect(-9, -7, 18, 14, 5);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = skin.rim;
    ctx.stroke();

    // Eye core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawWheel(wx, wy, radius, angle, rimColor) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e272e';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = rimColor;
    ctx.stroke();

    ctx.strokeStyle = '#d2dae2';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * -radius * 0.75, Math.sin(a) * -radius * 0.75);
      ctx.lineTo(Math.cos(a) * radius * 0.75, Math.sin(a) * radius * 0.75);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = rimColor;
    ctx.fill();

    ctx.restore();
  }
}
