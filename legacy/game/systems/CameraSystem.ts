import Phaser from 'phaser';

export class CameraSystem {
  private scene: Phaser.Scene;
  private target: Phaser.GameObjects.Components.Transform | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private punchX = 0;
  private punchY = 0;
  private lookAheadX = 0;
  private lookAheadY = 0;
  public targetZoom = 1;
  private currentZoom = 1;
  private baseZoom = 1;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  init(worldWidth: number, worldHeight: number): void {
    this.scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    
    // Base zoom calculation
    this.baseZoom = Phaser.Math.Clamp(this.scene.scale.width / 1050, 0.65, 1.25);
    this.currentZoom = this.baseZoom;
    this.targetZoom = this.baseZoom;
    this.scene.cameras.main.setZoom(this.baseZoom);
  }
  
  follow(target: Phaser.GameObjects.Components.Transform, offsetY?: number): void {
    this.target = target;
    this.offsetY = offsetY !== undefined ? offsetY : -110;
  }
  
  update(time: number, delta: number, targetVelX: number = 0, targetVelY: number = 0): void {
    if (!this.target) return;
    
    // 1. Look-ahead: offset camera in movement direction
    const lookAheadBlend = 1 - Math.exp(-delta / 200);
    this.lookAheadX = Phaser.Math.Linear(this.lookAheadX, targetVelX * 0.3, lookAheadBlend);
    this.lookAheadY = Phaser.Math.Linear(this.lookAheadY, targetVelY * 0.3, lookAheadBlend);
    
    // 2. Apply punch offset (spring back to 0 with damping)
    const punchDamping = Math.exp(-delta / 40);
    this.punchX *= punchDamping;
    this.punchY *= punchDamping;
    
    // 3. Smooth zoom
    const zoomBlend = 0.025;
    this.currentZoom = Phaser.Math.Linear(this.currentZoom, this.targetZoom, zoomBlend);
    this.scene.cameras.main.setZoom(this.currentZoom);
    
    // 4. Apply final position
    const finalX = this.target.x + this.offsetX + this.lookAheadX + this.punchX;
    const finalY = this.target.y + this.offsetY + this.lookAheadY + this.punchY;
    
    // 5. Set camera center
    this.scene.cameras.main.centerOn(finalX, finalY);
  }
  
  punch(dx: number, dy: number): void {
    this.punchX += dx;
    this.punchY += dy;
  }
  
  shake(duration: number = 200, intensity: number = 0.004): void {
    this.scene.cameras.main.shake(duration, intensity);
  }
  
  flash(duration: number = 250, r: number = 255, g: number = 255, b: number = 255): void {
    this.scene.cameras.main.flash(duration, r, g, b);
  }
  
  setZoom(zoom: number, immediate: boolean = false): void {
    this.targetZoom = zoom;
    if (immediate) {
      this.currentZoom = zoom;
      this.scene.cameras.main.setZoom(zoom);
    }
  }
  
  zoomTo(zoom: number, duration: number): void {
    this.scene.tweens.add({
      targets: this,
      targetZoom: zoom,
      duration: duration,
      ease: 'Sine.easeInOut'
    });
  }
  
  fadeIn(duration: number = 250): void {
    this.scene.cameras.main.fadeIn(duration, 0, 0, 0);
  }
  
  fadeOut(duration: number = 250): void {
    this.scene.cameras.main.fadeOut(duration, 0, 0, 0);
  }
  
  getBaseZoom(): number {
    return this.baseZoom;
  }
  
  destroy(): void {
    this.target = null;
  }
}
