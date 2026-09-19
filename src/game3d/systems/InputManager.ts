import type { InputState } from '@/types/game';

export class InputManager {
  private static instance: InputManager;
  
  private state: InputState = {
    moveX: 0,
    moveZ: 0,
    jump: false,
    jumpJustPressed: false,
    tail: false,
    tailJustPressed: false,
    tailJustReleased: false,
    lookDeltaX: 0,
    lookDeltaY: 0,
  };

  private keys = new Set<string>();
  private prevJump = false;
  private prevTail = false;
  
  private frameCount = 0;
  private lastComputedFrame = -1;
  
  public isMobile = false;

  private joystickMove = { x: 0, y: 0 };
  private touchJump = false;
  private touchTail = false;

  private constructor() {
    this.isMobile = typeof window !== 'undefined' && 'ontouchstart' in window;
  }

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  public init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this.onKeyDown, { passive: false });
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('click', this.onClick);
  }

  public destroy() {
    if (typeof window === 'undefined') return;

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('click', this.onClick);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keys.add(key);
    if (['w', 'a', 's', 'd', ' ', 'shift'].includes(key)) {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) { // Left click
      this.keys.add('mouse0');
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.keys.delete('mouse0');
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (document.pointerLockElement) {
      this.state.lookDeltaX += e.movementX;
      this.state.lookDeltaY += e.movementY;
    }
  };

  private onClick = (e: MouseEvent) => {
    if (!this.isMobile && !document.pointerLockElement && e.target instanceof HTMLCanvasElement) {
      e.target.requestPointerLock();
    }
  };

  public setJoystick(x: number, y: number) {
    this.joystickMove.x = x;
    this.joystickMove.y = y;
  }

  public setJumpButton(pressed: boolean) {
    this.touchJump = pressed;
  }

  public setTailButton(pressed: boolean) {
    this.touchTail = pressed;
  }

  public getState(): InputState {
    if (this.frameCount !== this.lastComputedFrame) {
      this.lastComputedFrame = this.frameCount;

      let moveX = 0;
      let moveZ = 0;

      if (this.keys.has('w')) moveZ -= 1;
      if (this.keys.has('s')) moveZ += 1;
      if (this.keys.has('a')) moveX -= 1;
      if (this.keys.has('d')) moveX += 1;

      // Normalize keyboard diagonal movement
      if (moveX !== 0 && moveZ !== 0) {
        const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
        moveX /= length;
        moveZ /= length;
      }

      // Touch joystick override
      if (this.isMobile && (this.joystickMove.x !== 0 || this.joystickMove.y !== 0)) {
        moveX = this.joystickMove.x;
        moveZ = this.joystickMove.y;
      }

      const currentJump = this.keys.has(' ') || this.touchJump;
      const currentTail = this.keys.has('shift') || this.keys.has('mouse0') || this.touchTail;

      this.state.moveX = moveX;
      this.state.moveZ = moveZ;
      
      this.state.jump = currentJump;
      this.state.jumpJustPressed = currentJump && !this.prevJump;
      
      this.state.tail = currentTail;
      this.state.tailJustPressed = currentTail && !this.prevTail;
      this.state.tailJustReleased = !currentTail && this.prevTail;

      this.prevJump = currentJump;
      this.prevTail = currentTail;
    }

    return this.state;
  }

  public endFrame() {
    this.frameCount++;
    this.state.lookDeltaX = 0;
    this.state.lookDeltaY = 0;
  }
}

export const inputManager = InputManager.getInstance();
export default inputManager;
