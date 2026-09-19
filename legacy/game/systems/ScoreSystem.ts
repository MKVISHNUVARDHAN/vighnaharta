import { Grade } from '@/types/game';
import { EventBus } from '@/game/EventBus';
import { FlowSystem } from './FlowSystem';

export class ScoreSystem {
  private scene: Phaser.Scene;
  private flowSystem: FlowSystem;
  private score: number = 0;
  private combo: number = 0;
  
  private riskMultiplier: number = 1;
  private riskMultiplierTimer: number = 0;

  constructor(scene: Phaser.Scene, flowSystem: FlowSystem) {
    this.scene = scene;
    this.flowSystem = flowSystem;
  }

  init(): void {}

  addPoints(basePoints: number, category: string): void {
    const flowMult = this.flowSystem.getFlowMultiplier();
    const finalPoints = Math.round(basePoints * flowMult * this.riskMultiplier);
    
    this.score += finalPoints;
    EventBus.emit('score-changed', this.score);
    
    // Combo logic
    if (['PERFECT_TURN', 'GOOD_TURN', 'CLUTCH', 'SHORTCUT'].includes(category)) {
      this.combo++;
      EventBus.emit('combo-changed', this.combo);
    }
  }

  getScore(): number {
    return this.score;
  }

  applyPenalty(points: number): void {
    this.score = Math.max(0, this.score - Math.abs(points));
    this.resetCombo();
    EventBus.emit('score-changed', this.score);
  }

  getCombo(): number {
    return this.combo;
  }

  resetCombo(): void {
    this.combo = 0;
    EventBus.emit('combo-changed', this.combo);
  }

  activateRiskMultiplier(multiplier: number, durationMs: number): void {
    this.riskMultiplier = Math.min(3, multiplier); // Anti-exploit cap
    this.riskMultiplierTimer = durationMs;
  }

  getGrade(): Grade {
    if (this.score >= 15000) return 'S+';
    if (this.score >= 12000) return 'S';
    if (this.score >= 9000) return 'A';
    if (this.score >= 6500) return 'B';
    return 'C';
  }

  update(time: number, delta: number): void {
    if (this.riskMultiplierTimer > 0) {
      this.riskMultiplierTimer -= delta;
      if (this.riskMultiplierTimer <= 0) {
        this.riskMultiplier = 1;
      }
    }
  }

  destroy(): void {}
}
