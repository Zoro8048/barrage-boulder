/**
 * Cannon Entity - Represents the player's mobile turret and tactical add-on states.
 */

import { PHYSICS, COMBAT } from '../config/constants.js';
import { clamp } from '../core/utils.js';

export class Cannon {
  constructor(x = 200, y = 600) {
    this.x = x;
    this.targetX = x;
    this.y = y;
    this.radius = PHYSICS.CANNON_RADIUS;
    this.wheelAngle = 0;
    this.recoil = 0;
    this.shootCooldown = 0;
    this.droneCooldown = COMBAT.DRONE_FIRE_INTERVAL;
    this.droneBobPhase = 0;
    this.sawCooldown = 0;
    this.sawAngle = 0;
    this.teslaCooldown = 1.2;
    this.teslaArc = null; // { targetX, targetY, timer }
    this.muzzleFlash = 0;
    this.abilityCooldown = 0;
    this.abilityMaxCooldown = 12;
    this.abilityActiveTimer = 0;
  }

  setBounds(width, groundY) {
    this.y = groundY;
    this.x = clamp(this.x, this.radius, width - this.radius);
    this.targetX = clamp(this.targetX, this.radius, width - this.radius);
  }

  center(width, groundY) {
    this.y = groundY;
    this.x = width / 2;
    this.targetX = width / 2;
  }

  update(dt, width, keyMoveDir = 0) {
    if (keyMoveDir !== 0) {
      this.targetX = clamp(
        this.targetX + keyMoveDir * PHYSICS.KEY_MOVE_SPEED * dt,
        this.radius,
        width - this.radius
      );
    }

    const prevX = this.x;
    this.x += (this.targetX - this.x) * Math.min(1, dt * PHYSICS.CANNON_TRACK_SMOOTHING);
    this.x = clamp(this.x, this.radius, width - this.radius);

    const dx = this.x - prevX;
    this.wheelAngle += dx / 13;
    this.droneBobPhase += dt * 4.5;
    this.sawAngle += dt * 16;

    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 28);
    if (this.muzzleFlash > 0) this.muzzleFlash = Math.max(0, this.muzzleFlash - dt * 14);
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.droneCooldown > 0) this.droneCooldown -= dt;
    if (this.sawCooldown > 0) this.sawCooldown = Math.max(0, this.sawCooldown - dt);
    if (this.teslaCooldown > 0) this.teslaCooldown -= dt;
    if (this.abilityCooldown > 0) this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);
    if (this.abilityActiveTimer > 0) this.abilityActiveTimer = Math.max(0, this.abilityActiveTimer - dt);
    if (this.teslaArc) {
      this.teslaArc.timer -= dt;
      if (this.teslaArc.timer <= 0) this.teslaArc = null;
    }
  }
}
