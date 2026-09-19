import { ObstacleType, LanePosition, RoadSegment } from '@/types/game';
import { EventBus } from '@/game/EventBus';
import { Hazard } from '../entities/Hazard';

export class ObstacleSystem {
  private scene: Phaser.Scene;
  private hazardPool: Hazard[] = [];
  private activeHazards: Hazard[] = [];
  private lastClutchTime: number = 0;
  private readonly CLUTCH_COOLDOWN = 600;
  private currentRoadId: string | null = null;
  private warnedIndices: Set<number> = new Set();
  private pendingDodges = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(): void {
    // Pre-allocate hazard pool
    for (let i = 0; i < 15; i++) {
      const hazard = new Hazard(this.scene);
      this.hazardPool.push(hazard);
    }
  }

  private getHazard(): Hazard {
    const pooled = this.hazardPool.find((h) => !h.isActive);
    if (pooled) return pooled;
    const newHazard = new Hazard(this.scene);
    this.hazardPool.push(newHazard);
    return newHazard;
  }

  /**
   * Loads and positions obstacles for a given road segment.
   */
  syncWithRoad(road: RoadSegment | null): void {
    if (!road || road.id === this.currentRoadId) return;
    this.currentRoadId = road.id;
    this.warnedIndices.clear();

    // Deactivate current active hazards
    this.activeHazards.forEach((h) => h.deactivate());
    this.activeHazards = [];

    if (!road.obstacleSlots || road.obstacleSlots.length === 0) return;

    const waypoints = road.waypoints;
    if (waypoints.length < 2) return;

    const laneWidth = 80;

    road.obstacleSlots.forEach((slot, index) => {
      const hazard = this.getHazard();
      const pos = Math.min(Math.max(slot.position, 0), 1);

      // Interpolate along waypoints
      const totalSegments = waypoints.length - 1;
      const scaledProgress = pos * totalSegments;
      const segIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
      const segT = scaledProgress - segIndex;

      const p1 = waypoints[segIndex];
      const p2 = waypoints[segIndex + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const angle = Math.atan2(dy, dx);

      const baseX = p1.x + dx * segT;
      const baseY = p1.y + dy * segT;

      const normalX = -Math.sin(angle);
      const normalY = Math.cos(angle);

      const worldX = baseX + normalX * (slot.lane * laneWidth);
      const worldY = baseY + normalY * (slot.lane * laneWidth);

      hazard.activate(slot.type, slot.lane, worldX, worldY);
      hazard.setData('slotIndex', index);
      hazard.setData('positionT', pos);
      hazard.setData('clutched', false);
      hazard.setData('passed', false);
      this.activeHazards.push(hazard);
    });
  }

  /**
   * Checks collision and clutch proximity against player world position.
   */
  checkCollisions(playerX: number, playerY: number, playerLane: LanePosition): { hit: boolean; clutch: boolean; type?: ObstacleType } {
    let hit = false;
    let clutch = false;
    let obstacleType: ObstacleType | undefined;

    for (const hazard of this.activeHazards) {
      if (!hazard.isActive) continue;

      const dist = Phaser.Math.Distance.Between(hazard.x, hazard.y, playerX, playerY);

      // Hit collision check
      if (hazard.checkCollision(playerX, playerY) && hazard.lane === playerLane) {
        hit = true;
        obstacleType = hazard.type;
        hazard.deactivate();
        break;
      }

      // Clutch near-miss check
      if (dist < 82 && Math.abs(hazard.lane - playerLane) >= 1 && !hazard.getData('clutched')) {
        const now = this.scene.time.now;
        if (now - this.lastClutchTime > this.CLUTCH_COOLDOWN) {
          this.lastClutchTime = now;
          clutch = true;
          hazard.setData('clutched', true);
          obstacleType = hazard.type;
          EventBus.emit('clutch-triggered', 400);
        }
      }
    }

    return { hit, clutch, type: obstacleType };
  }

  update(_time: number, _delta: number, playerProgress: number): void {
    // Telegraph warnings 2-3 seconds ahead
    for (const hazard of this.activeHazards) {
      if (!hazard.isActive) continue;

      const posT = hazard.getData('positionT') || 0;
      const slotIndex = hazard.getData('slotIndex');

      if (!hazard.getData('passed') && playerProgress > posT + .055) {
        hazard.setData('passed', true);
        this.pendingDodges++;
        hazard.deactivate();
        continue;
      }

      if (!this.warnedIndices.has(slotIndex) && posT > playerProgress && posT - playerProgress < 0.25) {
        this.warnedIndices.add(slotIndex);
        hazard.showWarning();
        EventBus.emit('obstacle-warning', hazard.type);
      }
    }
  }

  consumeDodges(): number {
    const count = this.pendingDodges;
    this.pendingDodges = 0;
    return count;
  }

  destroy(): void {
    this.activeHazards.forEach((h) => h.destroy());
    this.hazardPool.forEach((h) => h.destroy());
    this.activeHazards = [];
    this.hazardPool = [];
  }
}
