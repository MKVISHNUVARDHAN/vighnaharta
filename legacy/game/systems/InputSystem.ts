import { InputAction } from '@/types/game';

export class InputSystem {
  private scene: Phaser.Scene;
  private currentMode: 'touch' | 'keyboard' | 'mouse' = 'keyboard';
  private lastInputTime: number = 0;
  private inputCallback: ((action: InputAction) => void) | null = null;
  private junctionMode = false;
  
  private pointerDownPos: Phaser.Math.Vector2 | null = null;
  private pointerDownTime: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initializes input listeners for keyboard, mouse, and touch.
   */
  init(): void {
    this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.repeat) return;
      this.currentMode = 'keyboard';
      let action: InputAction | null = null;
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') action = this.junctionMode ? 'ROUTE_LEFT' : 'LANE_LEFT';
      else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') action = this.junctionMode ? 'ROUTE_RIGHT' : 'LANE_RIGHT';
      else if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') action = 'ROUTE_FORWARD';
      else if (event.key === ' ') action = 'ACTIVATE_ABILITY';
      
      if (action) this.handleAction(action);
    });

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.currentMode = pointer.wasTouch ? 'touch' : 'mouse';
      this.pointerDownPos = new Phaser.Math.Vector2(pointer.x, pointer.y);
      this.pointerDownTime = this.scene.time.now;
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.pointerDownPos) return;
      
      const duration = this.scene.time.now - this.pointerDownTime;
      if (duration > 350) {
        this.pointerDownPos = null;
        return; // Max duration exceeded
      }

      const dx = pointer.x - this.pointerDownPos.x;
      const dy = pointer.y - this.pointerDownPos.y;
      const distance = new Phaser.Math.Vector2(dx, dy).length();

      if (distance >= 40) { // Min distance for swipe
        if (Math.abs(dx) > Math.abs(dy)) {
          this.handleAction(dx > 0 ? (this.junctionMode ? 'ROUTE_RIGHT' : 'LANE_RIGHT') : (this.junctionMode ? 'ROUTE_LEFT' : 'LANE_LEFT'));
        } else {
          if (dy < 0) this.handleAction('ROUTE_FORWARD');
        }
      } else if (duration < 200) { // Tap
        this.handleAction('ACTIVATE_ABILITY');
      }
      this.pointerDownPos = null;
    });
  }

  /**
   * Registers a callback for when an input action occurs.
   */
  onAction(callback: (action: InputAction) => void): void {
    this.inputCallback = callback;
  }

  setJunctionMode(active: boolean): void { this.junctionMode = active; }

  private handleAction(action: InputAction): void {
    const now = this.scene.time.now;
    // 80ms debounce
    if (now - this.lastInputTime < 80) return;
    this.lastInputTime = now;
    if (this.inputCallback) this.inputCallback(action);
  }

  update(time: number, delta: number): void {
    // Inputs are event driven
  }

  destroy(): void {
    this.scene.input.keyboard?.removeAllListeners();
    this.scene.input.removeAllListeners();
  }
}
