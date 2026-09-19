import { RoadSegment, JunctionData, JunctionExit, Vec2 } from '@/types/game';
import { EventBus } from '@/game/EventBus';
import { ROAD_SEGMENTS, JUNCTIONS, START_NODE, END_NODE } from '@/game/data/mapData';

export class RouteSystem {
  private scene: Phaser.Scene;
  private visitedNodes: Set<string> = new Set();
  private visitedRoads: Map<string, number> = new Map();
  private currentRoad: RoadSegment | null = null;
  private currentJunction: JunctionData | null = null;
  private progress: number = 0;
  private atJunction: boolean = false;
  private decisionTimer: Phaser.Time.TimerEvent | null = null;
  public processionSpeedMultiplier: number = 1.0;
  private isFinished: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(): void {
    this.visitedNodes.clear();
    this.visitedRoads.clear();
    this.visitedNodes.add(START_NODE);
    this.currentRoad = ROAD_SEGMENTS[0] || null;
    this.currentJunction = null;
    this.progress = 0;
    this.atJunction = false;
    this.isFinished = false;
    if (this.decisionTimer) {
      this.decisionTimer.remove();
      this.decisionTimer = null;
    }
  }

  getCurrentRoad(): RoadSegment | null {
    return this.currentRoad;
  }

  getProgress(): number {
    return this.progress;
  }

  getVisitedNodes(): string[] {
    return Array.from(this.visitedNodes);
  }

  getVisitedRoads(): string[] {
    return Array.from(this.visitedRoads.keys());
  }

  isAtJunction(): boolean {
    return this.atJunction;
  }

  getCurrentJunction(): JunctionData | null {
    return this.currentJunction;
  }

  hasReachedDestination(): boolean {
    return this.isFinished;
  }

  /**
   * Evaluates player input at an intersection.
   */
  chooseRoute(direction: 'left' | 'right' | 'forward'): JunctionExit | null {
    if (!this.atJunction || !this.currentJunction) return null;

    const junction = this.currentJunction;
    // Look for matching exit or fallback to first available
    let chosenExit = junction.exits.find((e) => e.direction === direction);
    if (!chosenExit && junction.exits.length > 0) {
      chosenExit = junction.exits[0];
    }

    if (!chosenExit) return null;

    // Transition to chosen road
    const nextRoad = ROAD_SEGMENTS.find((r) => r.id === chosenExit.roadId);
    if (nextRoad) {
      this.currentRoad = nextRoad;
      this.progress = 0;
      this.atJunction = false;
      this.currentJunction = null;
      this.visitedNodes.add(nextRoad.startNode);

      const count = (this.visitedRoads.get(nextRoad.id) || 0) + 1;
      this.visitedRoads.set(nextRoad.id, count);

      if (this.decisionTimer) {
        this.decisionTimer.remove();
        this.decisionTimer = null;
      }

      EventBus.emit('junction-decided', chosenExit);
      return chosenExit;
    }

    return null;
  }

  /**
   * Calculates world coordinates for the procession given lane offset.
   */
  getCurrentPosition(laneOffset: number = 0): { x: number; y: number; angle: number } {
    if (!this.currentRoad || this.currentRoad.waypoints.length < 2) {
      return { x: 400, y: 500, angle: 0 };
    }

    const waypoints = this.currentRoad.waypoints;
    const totalSegments = waypoints.length - 1;
    const scaledProgress = Math.min(Math.max(this.progress, 0), 1) * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segmentT = scaledProgress - segmentIndex;

    const p1 = waypoints[segmentIndex];
    const p2 = waypoints[segmentIndex + 1];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const angle = Math.atan2(dy, dx);

    // Center point along the segment
    const baseX = p1.x + dx * segmentT;
    const baseY = p1.y + dy * segmentT;

    // Perpendicular normal vector for lane displacement
    const normalX = -Math.sin(angle);
    const normalY = Math.cos(angle);

    return {
      x: baseX + normalX * laneOffset,
      y: baseY + normalY * laneOffset,
      angle: angle * (180 / Math.PI),
    };
  }

  update(_time: number, delta: number): void {
    if (this.isFinished || !this.currentRoad || this.atJunction) return;

    // Advance procession along road
    const baseSpeed = 0.095; // roughly two minutes including junction decisions
    const speed = baseSpeed * this.processionSpeedMultiplier;
    this.progress += (delta / 1000) * speed;
    EventBus.emit('progress-changed', Math.min(1, (this.visitedRoads.size + this.progress) / (JUNCTIONS.length + 1)));

    // Junction trigger
    if (this.progress >= 1.0) {
      this.progress = 1.0;

      // Check if this was the final road reaching the temple destination
      if (this.currentRoad.endNode === END_NODE) {
        this.isFinished = true;
        this.visitedNodes.add(END_NODE);
        return;
      }

      const junction = JUNCTIONS.find((j) => j.id === this.currentRoad?.endNode);
      if (junction) {
        this.atJunction = true;
        this.currentJunction = junction;
        this.visitedNodes.add(junction.id);

        EventBus.emit('junction-approaching', junction);

        // A junction is an explicit command decision. The procession waits safely
        // until the player chooses; it never silently advances down an arbitrary road.
      }
    }
  }

  destroy(): void {
    if (this.decisionTimer) {
      this.decisionTimer.remove();
      this.decisionTimer = null;
    }
  }
}
