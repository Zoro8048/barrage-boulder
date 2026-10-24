/**
 * Generic Object Pool to minimize garbage collection spikes for high-frequency entities
 * (particles, bullets, floating text, shockwaves).
 */

export class ObjectPool {
  constructor(factoryFn, resetFn = null, initialSize = 32) {
    this.factoryFn = factoryFn;
    this.resetFn = resetFn;
    this.freeList = [];

    for (let i = 0; i < initialSize; i++) {
      this.freeList.push(this.factoryFn());
    }
  }

  acquire(initProps = {}) {
    const item = this.freeList.length > 0 ? this.freeList.pop() : this.factoryFn();
    if (this.resetFn) {
      this.resetFn(item);
    }
    Object.assign(item, initProps);
    return item;
  }

  release(item) {
    this.freeList.push(item);
  }
}
