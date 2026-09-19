import Phaser from 'phaser';

export class Pickup extends Phaser.GameObjects.Arc {
  public declare type: 'score_bonus' | 'flow_boost' | 'speed_boost';
  public isActive: boolean = false;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 15, 0, 360, false, 0xffffff);
    scene.add.existing(this);
    this.setVisible(false);
  }

  activate(type: 'score_bonus' | 'flow_boost' | 'speed_boost', x: number, y: number) {
    this.type = type;
    this.setPosition(x, y);
    this.isActive = true;
    this.setVisible(true);

    const colors = {
      'score_bonus': 0x00ff00,
      'flow_boost': 0x0000ff,
      'speed_boost': 0xffff00
    };

    this.setFillStyle(colors[type] || 0xffffff);
  }

  deactivate() {
    this.isActive = false;
    this.setVisible(false);
  }

  collect() {
    this.isActive = false;
    this.scene.tweens.add({
      targets: this,
      y: this.y - 50,
      alpha: 0,
      scale: 2,
      duration: 300,
      onComplete: () => this.deactivate()
    });
  }
}
