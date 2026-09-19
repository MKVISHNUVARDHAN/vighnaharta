import { LanePosition } from '@/types/game';

export class LaneSystem {
  private scene: Phaser.Scene;
  private currentLane: LanePosition = 0;
  private visualX: number = 0;
  private velocity: number = 0;
  
  private readonly LANE_WIDTH = 80;
  private readonly SPRING_STIFFNESS = 300;
  private readonly SPRING_DAMPING = 20;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(): void {
    this.visualX = this.getTargetX();
  }

  moveLeft(): void {
    if (this.currentLane > -1) this.currentLane--;
  }

  moveRight(): void {
    if (this.currentLane < 1) this.currentLane++;
  }

  getCurrentLane(): LanePosition {
    return this.currentLane as LanePosition;
  }

  getVisualX(): number {
    return this.visualX;
  }

  /**
   * Returns tilt angle based on current velocity for visual rotation
   */
  getBankAngle(): number {
    return this.velocity * 0.05; 
  }

  private getTargetX(): number {
    return this.currentLane * this.LANE_WIDTH;
  }

  update(time: number, delta: number): void {
    const dt = delta / 1000;
    if (dt <= 0) return;

    const targetX = this.getTargetX();
    const displacement = this.visualX - targetX;
    
    const springForce = -this.SPRING_STIFFNESS * displacement;
    const dampingForce = -this.SPRING_DAMPING * this.velocity;
    const acceleration = springForce + dampingForce;

    this.velocity += acceleration * dt;
    this.visualX += this.velocity * dt;
  }

  destroy(): void {}
}
