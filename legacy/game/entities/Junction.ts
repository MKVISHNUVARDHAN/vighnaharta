import Phaser from 'phaser';
import type { JunctionExit } from '../../types/game';

const routeColors: Record<string, number> = { safe: 0x7fd2d0, festival: 0xf6bf4f, shortcut: 0x78d99a, multiplier: 0xf07a55 };

export class Junction extends Phaser.GameObjects.Container {
  private base: Phaser.GameObjects.Arc;
  private indicators: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.base = scene.add.circle(0, 0, 26, 0x26334a, .85).setStrokeStyle(3, 0x7d8aa1, .5);
    this.add(this.base);
    scene.add.existing(this);
  }

  showDecisionUI(exits: JunctionExit[]) {
    this.base.setFillStyle(0xe5aa3c, .95).setStrokeStyle(4, 0xffe0a0, 1);
    this.indicators.forEach((i) => i.destroy());
    this.indicators = [];
    exits.forEach((exit) => {
      const offsets = exit.direction === 'left' ? { x: -105, y: -92, angle: -55 } : exit.direction === 'right' ? { x: 105, y: 58, angle: 55 } : { x: 10, y: -125, angle: 0 };
      const c = this.scene.add.container(offsets.x, offsets.y);
      const panel = this.scene.add.rectangle(0, 0, 126, 48, 0x09111f, .94).setStrokeStyle(2, routeColors[exit.type], .95);
      const arrow = this.scene.add.triangle(-43, 0, 0, 8, 16, 0, 0, -8, routeColors[exit.type]).setAngle(offsets.angle);
      const label = this.scene.add.text(13, -7, exit.type === 'multiplier' ? '×2 RISK' : exit.type.toUpperCase(), { fontFamily: 'Arial', fontSize: '13px', fontStyle: 'bold', color: '#fff4dc' }).setOrigin(.5, 0);
      c.add([panel, arrow, label]);
      this.indicators.push(c);
      this.add(c);
      this.scene.tweens.add({ targets: c, y: c.y - 6, duration: 350, yoyo: true, repeat: -1, delay: this.indicators.length * 70, ease: 'Sine.easeInOut' });
    });
  }

  hideDecisionUI() { this.indicators.forEach((i) => i.destroy()); this.indicators = []; this.base.setFillStyle(0x26334a, .85); }
  activate() { this.base.setFillStyle(0xffdc75, 1); }
  deactivate() { this.base.setFillStyle(0x26334a, .85); }
}
