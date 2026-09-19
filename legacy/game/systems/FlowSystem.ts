import { EventBus } from '@/game/EventBus';

export class FlowSystem {
  private scene: Phaser.Scene;
  private flow: number = 0;
  private maxFlow: number = 100;
  private active: boolean = false;
  private activeTimer: number = 0;
  
  private readonly DECAY_RATE = 2; // per second
  private readonly ACTIVATION_DURATION = 8000; // 8 seconds
  private readonly MULTIPLIER = 1.5;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(): void {}

  addFlow(amount: number): void {
    if (this.active) return;
    
    this.flow = Math.min(this.maxFlow, this.flow + amount);
    EventBus.emit('flow-changed', this.flow);

    if (this.flow >= this.maxFlow) {
      this.activateFlow();
    }
  }

  private activateFlow(): void {
    this.active = true;
    this.activeTimer = this.ACTIVATION_DURATION;
    EventBus.emit('flow-activated');
  }

  getFlow(): number {
    return this.flow;
  }

  isFlowActive(): boolean {
    return this.active;
  }

  getFlowMultiplier(): number {
    return this.active ? this.MULTIPLIER : 1;
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000;

    if (this.active) {
      this.activeTimer -= delta;
      this.flow = (this.activeTimer / this.ACTIVATION_DURATION) * this.maxFlow;
      EventBus.emit('flow-changed', Math.max(0, this.flow));

      if (this.activeTimer <= 0) {
        this.active = false;
        this.flow = 0;
        EventBus.emit('flow-ended');
        EventBus.emit('flow-changed', 0);
      }
    } else {
      if (this.flow > 0) {
        this.flow = Math.max(0, this.flow - this.DECAY_RATE * dt);
        EventBus.emit('flow-changed', this.flow);
      }
    }
  }

  destroy(): void {}
}
