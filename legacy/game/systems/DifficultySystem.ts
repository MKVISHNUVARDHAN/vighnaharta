import { ActName, DifficultyParams } from '@/types/game';
import { EventBus } from '@/game/EventBus';
import { getDifficultyParams, getActForTime } from '@/game/data/difficultyConfig';

export class DifficultySystem {
  private scene: Phaser.Scene;
  private elapsedTime: number = 0;
  private currentAct: ActName = 'DUSK';
  private currentParams: DifficultyParams;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.currentParams = getDifficultyParams(0);
  }

  init(): void {
    this.elapsedTime = 0;
    this.currentAct = 'DUSK';
    this.currentParams = getDifficultyParams(0);
    EventBus.emit('act-changed', this.currentAct);
  }

  getCurrentParams(): DifficultyParams {
    return this.currentParams;
  }

  getAct(): ActName {
    return this.currentAct;
  }

  getElapsedTime(): number {
    return this.elapsedTime;
  }

  private setAct(act: ActName): void {
    if (this.currentAct !== act) {
      this.currentAct = act;
      EventBus.emit('act-changed', this.currentAct);
    }
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    this.elapsedTime += dt;

    this.currentParams = getDifficultyParams(this.elapsedTime);
    const newAct = getActForTime(this.elapsedTime);
    this.setAct(newAct);
  }

  destroy(): void {}
}
