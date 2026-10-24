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

    // Bullets & Distinct Power-Up Projectiles
    this.drawBullets(engine.bullets, skin);

    // Pierce Beam Laser Lances
    if (engine.laserBeams && engine.laserBeams.length > 0) {
      this.drawLaserBeams(engine.laserBeams);
    }

    // Incoming Boulder Spawn Lane Warning Indicator
    if (engine.gameState === 'PLAYING') {
      const warning = engine.waveSystem.getPendingWarning(
        engine.rocks,
        engine.saveManager.state.wave
      );
      if (warning) {
        this.drawSpawnWarning(warning, width, time);
      }
    }

    // Rocks
    for (const r of engine.rocks) {
      this.drawRock(r, engine.activePowerups.freeze > 0);
    }

    // Cannon & Wingman Drones
    this.drawCannon(skin);

    // Ground & Underground Thumb Trackpad Zone
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
    const { ctx, engine } = this;
    ctx.fillStyle = theme.grassTop;
    ctx.fillRect(0, groundY, width, 8);
    ctx.fillStyle = theme.grassSub;
    ctx.fillRect(0, groundY + 8, width, 5);

    const earthGrad = ctx.createLinearGradient(0, groundY + 13, 0, height);
    earthGrad.addColorStop(0, theme.earthTop);
    earthGrad.addColorStop(1, theme.earthBot);
    ctx.fillStyle = earthGrad;
    ctx.fillRect(0, groundY + 13, width, height - groundY - 13);

    // Underground Ergonomic Thumb Trackpad Zone (shown during active gameplay so thumb never blocks cannon)
    if (engine.gameState === 'PLAYING') {
      const trackY = groundY + (height - groundY) * 0.56;
      const trackLeft = 36;
      const trackRight = width - 36;
      const trackW = Math.max(80, trackRight - trackLeft);

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(trackLeft, trackY - 3, trackW, 6, 3);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.font = '800 9px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('◀ DRAG THUMB HERE ▶', width / 2, trackY + 18);

      // Glowing thumb position indicator synced with cannon.x
      const puckX = Math.max(trackLeft, Math.min(trackRight, engine.cannon.x));
      ctx.beginPath();
      ctx.arc(puckX, trackY, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#38b6ff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();
    }
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

      // Outer pulse ring
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 5, 0, Math.PI * 2);
      ctx.fillStyle = `${meta.color}33`;
      ctx.fill();

      // Core orb
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#141b33';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = meta.color;
      ctx.stroke();

      // Icon
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(meta.icon, 0, 1);

      // Readable Short Tag Badge below orb so player knows what power-up is falling
      if (meta.shortTag) {
        ctx.font = '900 9px -apple-system, BlinkMacSystemFont, sans-serif';
        const tagW = ctx.measureText(meta.shortTag).width + 8;
        ctx.fillStyle = 'rgba(10, 14, 28, 0.88)';
        ctx.beginPath();
        ctx.roundRect(-tagW / 2, p.radius + 3, tagW, 13, 4);
        ctx.fill();
        ctx.strokeStyle = meta.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = meta.color;
        ctx.fillText(meta.shortTag, 0, p.radius + 9.5);
      }

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

      // 1. Saw Calibre: Spinning serrated fiery sawblade disc
      if (b.shape === 'saw') {
        ctx.translate(b.x, b.y);
        ctx.rotate(b.spinAngle || 0);
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff9f1a';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ff3838';
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();
        continue;
      }

      // 2. Ricochet Fan: Spinning 4-point star blade
      if (b.shape === 'star') {
        ctx.translate(b.x, b.y);
        ctx.rotate(b.spinAngle || 0);
        ctx.fillStyle = '#ff9f1a';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let p = 0; p < 8; p++) {
          const rad = p % 2 === 0 ? b.radius * 1.35 : b.radius * 0.45;
          const ang = (p * Math.PI) / 4;
          if (p === 0) ctx.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
          else ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        continue;
      }

      // 3. Blast Shells: Heavy cluster mortar bomb or shrapnel spark
      if (b.shape === 'bomb' || b.shape === 'shrapnel') {
        ctx.translate(b.x, b.y);
        ctx.beginPath();
        ctx.arc(0, 0, b.radius * 1.15, 0, Math.PI * 2);
        ctx.fillStyle = b.shape === 'bomb' ? '#eb2f06' : '#ff9f1a';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fffa65';
        ctx.stroke();
        ctx.restore();
        continue;
      }

      // 4. Overdrive: Twin electric cyan hyper-tracer needle
      if (b.shape === 'needle') {
        ctx.fillStyle = '#48dbfb';
        ctx.beginPath();
        ctx.roundRect(b.x - 2.5, b.y - 14, 5, 28, 2.5);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(b.x - 1, b.y - 12, 2, 20);
        ctx.restore();
        continue;
      }

      // Standard Cannon Bullet
      const grad = ctx.createLinearGradient(b.x, b.y - 12, b.x, b.y + 12);
      grad.addColorStop(0, skin.bulletTop);
      grad.addColorStop(0.4, skin.bulletMid);
      grad.addColorStop(1, skin.bulletBot);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(b.x - 4, b.y - 9, 8, 18, 4);
      ctx.fill();
      ctx.restore();
    }
  }

  drawLaserBeams(laserBeams) {
    const { ctx } = this;
    for (const beam of laserBeams) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, beam.life));

      // Outer magenta glow
      const w = beam.width * 2.2;
      const grad = ctx.createLinearGradient(beam.x - w / 2, 0, beam.x + w / 2, 0);
      grad.addColorStop(0, 'rgba(217, 128, 250, 0)');
      grad.addColorStop(0.3, 'rgba(217, 128, 250, 0.65)');
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(0.7, 'rgba(217, 128, 250, 0.65)');
      grad.addColorStop(1, 'rgba(217, 128, 250, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(beam.x - w / 2, 0, w, beam.y);

      // Core white laser line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(beam.x - 2, 0, 4, beam.y);
      ctx.restore();
    }
  }

  drawSpawnWarning(warning, width, time) {
    const { ctx } = this;
    const pulse = 0.55 + 0.45 * Math.sin(time * 0.02);
    const x = warning.fromLeft ? 22 : width - 22;
    const y = warning.y;
    const color = warning.isBoss ? '#ff4757' : warning.variant === 'fast' ? '#ff9f1a' : '#ffcf33';

    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.fillStyle = 'rgba(10, 14, 28, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = '900 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const badge = warning.isBoss ? '👑' : warning.variant === 'fast' ? '☄️' : warning.fromLeft ? '▶' : '◀';
    ctx.fillText(badge, x, y + 0.5);
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
        : isFrozen || r.chillTimer > 0
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

    // Progressive Internal Fracture Cracks (Appear below 65% HP, glow hot below 30% HP)
    if (r.cracks && r.crackStage >= 1) {
      const count = r.crackStage >= 2 ? r.cracks.length : 2;
      ctx.save();
      ctx.strokeStyle = r.crackStage >= 2 ? '#ffda79' : 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = r.crackStage >= 2 ? 2.5 : 1.8;
      ctx.beginPath();
      for (let c = 0; c < count; c++) {
        const ck = r.cracks[c];
        ctx.moveTo(0, 0);
        ctx.lineTo(ck.midX, ck.midY);
        ctx.lineTo(ck.endX, ck.endY);
      }
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    if (r.variant === 'tntBarrel') {
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧨', 0, -r.radius - 8);
    } else if (r.variant === 'goldGeode') {
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💎', 0, -r.radius - 8);
    } else if (r.isMilestone) {
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
    const { cannon, invulnerableTimer, activePowerups, saveManager } = engine;
    const variety = saveManager.getActiveCannon();
    const addon = saveManager.getActiveAddon();

    // Draw Tesla Lightning Arc in world space if active
    if (cannon.teslaArc) {
      ctx.save();
      ctx.strokeStyle = '#48dbfb';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cannon.x, cannon.y - 42);
      const midX = (cannon.x + cannon.teslaArc.targetX) / 2 + (Math.random() - 0.5) * 28;
      const midY = (cannon.y - 42 + cannon.teslaArc.targetY) / 2;
      ctx.lineTo(midX, midY);
      ctx.lineTo(cannon.teslaArc.targetX, cannon.teslaArc.targetY);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(cannon.x, cannon.y);

    // Holo-Scope Laser Sight Add-On
    if (addon.id === 'laserSight') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 71, 87, 0.42)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -52);
      ctx.lineTo(0, -engine.groundY);
      ctx.stroke();
      ctx.restore();
    }

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

    // Magnet Vortex rotating golden gravity ring
    if (activePowerups.magnet > 0) {
      ctx.save();
      ctx.translate(0, -22);
      ctx.rotate(performance.now() * 0.004);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 207, 51, 0.78)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.restore();
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

    const baseBarrels = engine.getBarrelCount();
    const barrels = Math.max(1, baseBarrels + (variety.extraBarrels || 0));
    const barrelWidth =
      variety.id === 'mortar'
        ? 20
        : variety.id === 'railgun'
        ? 16
        : barrels >= 3
        ? 10
        : 14;
    const barrelHeight = variety.id === 'railgun' ? 38 : variety.id === 'mortar' ? 26 : 30;
    const spacing = 10;
    const totalSpan = (barrels - 1) * spacing;

    for (let i = 0; i < barrels; i++) {
      const bx = -totalSpan / 2 + i * spacing - barrelWidth / 2;
      const by = -20 - barrelHeight + cannon.recoil;

      const bGrad = ctx.createLinearGradient(bx, by, bx + barrelWidth, by);
      bGrad.addColorStop(0, '#576574');
      bGrad.addColorStop(0.5, skin.barrelMid);
      bGrad.addColorStop(1, '#222f3e');

      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.roundRect(bx, by, barrelWidth, barrelHeight, 4);
      ctx.fill();

      ctx.fillStyle = skin.rim;
      ctx.fillRect(bx - 1, by, barrelWidth + 2, 5);
    }

    // Bumper Buzzsaw Add-On
    if (addon.id === 'sawBlade') {
      ctx.save();
      ctx.translate(0, -34);
      ctx.rotate(cannon.sawAngle);
      ctx.globalAlpha = cannon.sawCooldown > 0 ? 0.35 : 0.95;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff9f1a';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // Arc Tesla Pylon Add-On
    if (addon.id === 'teslaCoil') {
      ctx.save();
      ctx.fillStyle = '#48dbfb';
      ctx.beginPath();
      ctx.arc(0, -38, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const bodyGrad = ctx.createLinearGradient(-18, -32, 18, -8);
    bodyGrad.addColorStop(0, skin.bodyTop);
    bodyGrad.addColorStop(1, skin.bodyBot);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-20, -30 + cannon.recoil * 0.4, 40, 22, 9);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = addon.id === 'cryoCore' ? '#7ed6df' : skin.stroke;
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
