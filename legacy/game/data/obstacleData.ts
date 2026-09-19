import type { ObstacleType, LanePosition } from '@/types/game';

export interface ObstacleDef {
  name: string;
  description: string;
  lanesBlocked: LanePosition[];
  telegraphMs: number;
  warningType: 'visual' | 'audio' | 'both';
  hitboxWidth: number;
  hitboxHeight: number;
  proximityMultiplier: number;
  color: number; // Hex number for Phaser
}

export const OBSTACLES: Record<ObstacleType, ObstacleDef> = {
  barricade: {
    name: 'Barricade',
    description: 'A static barricade blocking one lane.',
    lanesBlocked: [0],
    telegraphMs: 1500,
    warningType: 'visual',
    hitboxWidth: 64,
    hitboxHeight: 32,
    proximityMultiplier: 1.0,
    color: 0xff0000
  },
  crowd_surge: {
    name: 'Crowd Surge',
    description: 'Crowd spilling into multiple lanes.',
    lanesBlocked: [-1, 0],
    telegraphMs: 2000,
    warningType: 'both',
    hitboxWidth: 128,
    hitboxHeight: 48,
    proximityMultiplier: 1.2,
    color: 0xff8800
  },
  puddle: {
    name: 'Puddle',
    description: 'Slippery puddle on the road.',
    lanesBlocked: [1],
    telegraphMs: 1000,
    warningType: 'visual',
    hitboxWidth: 80,
    hitboxHeight: 80,
    proximityMultiplier: 0.8,
    color: 0x0088ff
  },
  construction: {
    name: 'Construction',
    description: 'Road repair blocking multiple lanes.',
    lanesBlocked: [0, 1],
    telegraphMs: 2500,
    warningType: 'visual',
    hitboxWidth: 128,
    hitboxHeight: 64,
    proximityMultiplier: 1.5,
    color: 0xffff00
  },
  gate_closing: {
    name: 'Closing Gate',
    description: 'A gate slowly closing over the route.',
    lanesBlocked: [-1, 0, 1],
    telegraphMs: 3000,
    warningType: 'both',
    hitboxWidth: 192,
    hitboxHeight: 32,
    proximityMultiplier: 2.0,
    color: 0x8800ff
  },
  power_failure: {
    name: 'Power Failure',
    description: 'Darkness covering the path.',
    lanesBlocked: [-1, 1],
    telegraphMs: 1500,
    warningType: 'both',
    hitboxWidth: 192,
    hitboxHeight: 128,
    proximityMultiplier: 1.0,
    color: 0x222222
  }
};
