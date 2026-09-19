import { RangoliPattern } from '@/types/game';
import { EventBus } from '@/game/EventBus';
import { RANGOLI_PATTERNS } from '@/game/data/rangoliData';

export class RangoliSystem {
  private scene: Phaser.Scene;
  private discoveredPatterns: RangoliPattern[] = [];
  private allPatterns: RangoliPattern[] = RANGOLI_PATTERNS;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(): void {
    this.discoveredPatterns = [];
  }

  checkForRangoli(visitedNodes: string[]): RangoliPattern | null {
    const visitedSet = new Set(visitedNodes);

    for (const pattern of this.allPatterns) {
      if (this.discoveredPatterns.find((p) => p.id === pattern.id)) continue;

      const isMatch = pattern.requiredNodes.every((node) => visitedSet.has(node));
      if (isMatch) {
        this.discoveredPatterns.push(pattern);
        EventBus.emit('rangoli-discovered', pattern);
        return pattern;
      }
    }

    return null;
  }

  getDiscoveredRangolis(): RangoliPattern[] {
    return this.discoveredPatterns;
  }

  update(_time: number, _delta: number): void {}

  destroy(): void {
    this.discoveredPatterns = [];
  }
}
