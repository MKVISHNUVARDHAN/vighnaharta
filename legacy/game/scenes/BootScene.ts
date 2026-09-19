import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const graphics = this.add.graphics();
    
    // 'pixel'
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 1, 1);
    graphics.generateTexture('pixel', 1, 1);
    graphics.clear();

    // 'road-tile'
    graphics.fillStyle(0x333333, 1);
    graphics.beginPath();
    graphics.moveTo(64, 0);
    graphics.lineTo(128, 32);
    graphics.lineTo(64, 64);
    graphics.lineTo(0, 32);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('road-tile', 128, 64);
    graphics.clear();

    // 'procession'
    graphics.fillStyle(0xffd700, 1);
    graphics.fillRect(0, 0, 60, 40);
    graphics.generateTexture('procession', 60, 40);
    graphics.clear();

    // 'obstacle'
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.clear();

    // 'junction-marker'
    graphics.fillStyle(0xaaaaaa, 1);
    graphics.fillCircle(30, 30, 30);
    graphics.generateTexture('junction-marker', 60, 60);
    graphics.clear();

    // 'arrow-indicator'
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(0, 20, 10, 0, 20, 20);
    graphics.generateTexture('arrow-indicator', 20, 20);
    graphics.clear();

    // 'particle'
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 4, 4);
    graphics.generateTexture('particle', 4, 4);
    graphics.clear();

    this.scene.start('PreloadScene');
  }
}
