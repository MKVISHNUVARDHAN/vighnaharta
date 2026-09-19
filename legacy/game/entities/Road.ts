import Phaser from 'phaser';
import type { Vec2 } from '../../types/game';

export class Road extends Phaser.GameObjects.Container {
  public illuminated = false;
  private waypoints: Vec2[] = [];
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.graphics = scene.add.graphics();
    this.add(this.graphics);
    scene.add.existing(this);
  }

  drawRoad(waypoints: Vec2[]) {
    this.waypoints = waypoints;
    this.graphics.clear();
    if (waypoints.length < 2) return;

    this.graphics.lineStyle(188, this.illuminated ? 0xe7aa33 : 0x101827, this.illuminated ? .22 : .7);
    this.stroke();
    this.graphics.lineStyle(164, this.illuminated ? 0x353944 : 0x202b3b, 1);
    this.stroke();
    this.graphics.lineStyle(3, this.illuminated ? 0xffcf67 : 0x657087, this.illuminated ? .75 : .32);
    this.stroke();

    [-52, 52].forEach((offset) => {
      for (let i = 0; i < waypoints.length - 1; i++) {
        const p1 = waypoints[i];
        const p2 = waypoints[i + 1];
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const nx = -Math.sin(angle) * offset;
        const ny = Math.cos(angle) * offset;
        this.graphics.lineStyle(2, this.illuminated ? 0xf8d486 : 0x778399, .25);
        this.graphics.lineBetween(p1.x + nx, p1.y + ny, p2.x + nx, p2.y + ny);
      }
    });
  }

  private stroke() {
    this.graphics.beginPath();
    this.graphics.moveTo(this.waypoints[0].x, this.waypoints[0].y);
    this.waypoints.slice(1).forEach((p) => this.graphics.lineTo(p.x, p.y));
    this.graphics.strokePath();
  }

  illuminate() {
    if (this.illuminated) return;
    this.illuminated = true;
    this.drawRoad(this.waypoints);
    this.scene.tweens.add({ targets: this, alpha: { from: .55, to: 1 }, duration: 500, ease: 'Sine.easeOut' });
  }
}
