/**
 * InputSystem - Normalizes pointer, touch, mouse, and keyboard inputs.
 */

import { clamp } from '../core/utils.js';

export class InputSystem {
  constructor(canvas, cannon, callbacks = {}) {
    this.canvas = canvas;
    this.cannon = cannon;
    this.callbacks = callbacks;
    this.isDragging = false;
    this.keys = {
      left: false,
      right: false,
      space: false,
    };

    this.bindEvents();
  }

  reset() {
    this.isDragging = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.space = false;
  }

  isFiring() {
    return this.isDragging || this.keys.space;
  }

  getKeyMoveDirection() {
    return (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
  }

  updatePointerTarget(clientX) {
    const rect = this.canvas.getBoundingClientRect();
    const relX = clientX - rect.left;
    const width = this.callbacks.getViewportWidth ? this.callbacks.getViewportWidth() : rect.width;
    this.cannon.targetX = clamp(relX, this.cannon.radius, width - this.cannon.radius);
  }

  bindEvents() {
    const canInteract = () =>
      (!this.callbacks.canInteract || this.callbacks.canInteract()) &&
      (!this.callbacks.isModalOpen || !this.callbacks.isModalOpen());

    this.canvas.addEventListener('pointerdown', (e) => {
      if (!canInteract()) return;
      this.isDragging = true;
      this.canvas.setPointerCapture(e.pointerId);
      this.updatePointerTarget(e.clientX);
      if (this.callbacks.onActionStart) {
        this.callbacks.onActionStart();
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      this.updatePointerTarget(e.clientX);
    });

    const endDrag = () => {
      this.isDragging = false;
    };
    this.canvas.addEventListener('pointerup', endDrag);
    this.canvas.addEventListener('pointercancel', endDrag);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        this.callbacks.onTogglePause?.();
        return;
      }
      if (e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        this.callbacks.onTriggerUltimate?.();
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Space') {
        e.preventDefault();
      }
      if (!canInteract()) return;

      if (e.code === 'ArrowLeft') {
        this.keys.left = true;
        this.callbacks.onActionStart?.();
      } else if (e.code === 'ArrowRight') {
        this.keys.right = true;
        this.callbacks.onActionStart?.();
      } else if (e.code === 'Space') {
        this.keys.space = true;
        this.callbacks.onActionStart?.();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft') this.keys.left = false;
      if (e.code === 'ArrowRight') this.keys.right = false;
      if (e.code === 'Space') this.keys.space = false;
    });

    window.addEventListener('blur', () => this.reset());
  }
}
