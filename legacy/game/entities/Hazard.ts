import Phaser from 'phaser';
import type { ObstacleType, LanePosition } from '../../types/game';

export class Hazard extends Phaser.GameObjects.Container {
  public declare type: ObstacleType;
  public declare lane: LanePosition;
  public isActive = false;
  public isLethal = true;
  private art: Phaser.GameObjects.Container;
  private warning: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.art = scene.add.container();
    this.warning = scene.add.graphics();
    this.add([this.warning, this.art]);
    scene.add.existing(this);
    this.setVisible(false);
  }

  activate(type: ObstacleType, lane: LanePosition, x: number, y: number) {
    this.type = type;
    this.lane = lane;
    this.setPosition(x, y).setDepth(y + 14).setVisible(true).setAlpha(1);
    this.isActive = true;
    this.art.removeAll(true);
    this.warning.clear();
    const colors: Record<ObstacleType, number> = {
      barricade: 0xe15b36, crowd_surge: 0x8e5aa6, puddle: 0x3d8296,
      construction: 0xe0a33b, gate_closing: 0xe55c36, power_failure: 0x7887a6,
    };
    const color = colors[type];
    this.art.add(this.scene.add.ellipse(0, 12, 72, 28, 0x02040a, .55));
    if (type === 'barricade' || type === 'construction' || type === 'gate_closing') {
      const bar = this.scene.add.rectangle(0, -7, 76, 24, color).setStrokeStyle(3, 0xffe0a0);
      const stripe1 = this.scene.add.rectangle(-20, -7, 10, 24, 0x29172a).setAngle(-18);
      const stripe2 = this.scene.add.rectangle(20, -7, 10, 24, 0x29172a).setAngle(-18);
      const legs = this.scene.add.rectangle(0, 9, 88, 5, 0xd5a54e);
      this.art.add([bar, stripe1, stripe2, legs]);
    } else if (type === 'puddle') {
      this.art.add(this.scene.add.ellipse(0, 5, 92, 42, color, .75).setStrokeStyle(3, 0x8bd3dd, .8));
      this.art.add(this.scene.add.ellipse(-12, 0, 35, 8, 0xd8fbff, .35));
    } else if (type === 'crowd_surge') {
      [-25, 0, 25].forEach((px, i) => {
        this.art.add(this.scene.add.circle(px, -18 - (i % 2) * 6, 10, 0xdda86f));
        this.art.add(this.scene.add.rectangle(px, 4, 19, 37, i === 1 ? color : 0xca6847).setOrigin(.5, 1));
      });
    } else {
      this.art.add(this.scene.add.rectangle(0, -5, 58, 52, 0x253149).setStrokeStyle(3, color));
      this.art.add(this.scene.add.text(0, -6, '⚡', { fontSize: '28px', color: '#f5c85c' }).setOrigin(.5));
    }
  }

  deactivate() { this.isActive = false; this.setVisible(false); }

  showWarning() {
    this.warning.clear().lineStyle(4, 0xffb23f, 1).strokeTriangle(-48, 34, 0, -62, 48, 34);
    this.warning.fillStyle(0xfff2ca, 1).fillCircle(0, 10, 4);
    this.scene.tweens.add({ targets: this.warning, alpha: { from: .25, to: 1 }, scale: { from: .9, to: 1.08 }, duration: 170, yoyo: true, repeat: 4 });
  }

  checkCollision(playerX: number, playerY: number) {
    return this.isActive && this.isLethal && Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY) < 46;
  }
}
