import Phaser from 'phaser';

export function createGameConfig(parentElement: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: parentElement,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    input: {
      activePointers: 3,
      touch: {
        capture: true
      }
    },
    render: {
      antialias: true,
      pixelArt: false
    },
    backgroundColor: '#0a0a1a',
    scene: []
  };
}
