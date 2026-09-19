export interface IPoolable {
  setActive(active: boolean): void;
}

export class ObjectPool<T extends IPoolable> {
  private pool: T[] = [];
  private factory: () => T;

  constructor(factory: () => T, initialSize: number = 0) {
    this.factory = factory;
    for (let i = 0; i < initialSize; i++) {
      const obj = this.factory();
      obj.setActive(false);
      this.pool.push(obj);
    }
  }

  get(): T {
    let obj: T | undefined = this.pool.find(item => {
      // In Phaser, objects often have active property.
      // We assume if it's in the pool but not active, it's available.
      return !(item as any).active; 
    });

    if (!obj) {
      obj = this.factory();
      this.pool.push(obj);
    }
    
    obj.setActive(true);
    return obj;
  }

  release(item: T): void {
    item.setActive(false);
  }

  releaseAll(): void {
    this.pool.forEach(item => item.setActive(false));
  }
}
