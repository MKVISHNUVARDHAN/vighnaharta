import React, { useLayoutEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { PrologueScene } from './scenes/PrologueScene';
import { GameScene } from './scenes/GameScene';
import { RoadRallyScene } from './scenes/RoadRallyScene';
import { ModakCatchScene } from './scenes/ModakCatchScene';
import { FlowerFestivalScene } from './scenes/FlowerFestivalScene';
import { DholUtsavScene } from './scenes/DholUtsavScene';
import { MonsoonCrossingScene } from './scenes/MonsoonCrossingScene';
import { RangoliLightScene } from './scenes/RangoliLightScene';
import { FinaleScene } from './scenes/FinaleScene';

const PhaserGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current!,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene: [
        BootScene,
        PreloadScene,
        PrologueScene,
        GameScene,
        RoadRallyScene,
        ModakCatchScene,
        FlowerFestivalScene,
        DholUtsavScene,
        MonsoonCrossingScene,
        RangoliLightScene,
        FinaleScene,
      ],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    gameRef.current = new Phaser.Game(config);

    // Auto-focus container and canvas so arrow keys work immediately
    setTimeout(() => {
      containerRef.current?.focus();
      const canvas = containerRef.current?.querySelector('canvas');
      canvas?.focus();
    }, 100);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="w-full h-full outline-none focus:outline-none"
      onClick={() => {
        containerRef.current?.focus();
        const canvas = containerRef.current?.querySelector('canvas');
        canvas?.focus();
      }}
    />
  );
};

export default PhaserGame;
