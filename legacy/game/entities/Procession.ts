import Phaser from "phaser";

type TrailPoint = { x: number; y: number };
type Walker = { sprite: Phaser.GameObjects.Sprite; drum?: Phaser.GameObjects.Ellipse; offset: number; lateral: number };

export class Procession extends Phaser.GameObjects.Container {
  private platform: Phaser.GameObjects.Sprite;
  private glow: Phaser.GameObjects.Arc;
  private walkers: Walker[] = [];
  private chant: Phaser.GameObjects.Text;
  private trail: TrailPoint[] = [];
  private moving = false;
  private stride = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.glow = scene.add.circle(0, -20, 88, 0xffd75d, 0.18).setBlendMode(Phaser.BlendModes.ADD);
    this.platform = scene.add.sprite(0, 0, "ganesha").setScale(0.18).setOrigin(0.5, 0.88);
    this.add([this.glow, this.platform]);

    const textures = ["devotee", "devotee_flag", "devotee_dancer"];
    for (let i = 0; i < 8; i++) {
      const texture = textures[i % textures.length];
      const sprite = scene.add.sprite(0, 0, texture).setScale(texture === "devotee" ? 0.12 : 0.085).setOrigin(0.5, 0.92);
      const walker: Walker = { sprite, offset: 92 + Math.floor(i / 2) * 88, lateral: i % 2 ? 30 : -30 };
      if (i < 4) {
        walker.drum = scene.add.ellipse(0, 0, 22, 15, i % 2 ? 0xc98034 : 0xe6b44e).setStrokeStyle(2, 0xffe2a0);
        this.add(walker.drum);
      }
      this.walkers.push(walker); this.add(sprite);
    }

    this.chant = scene.add.text(0, -130, "♪ GANPATI BAPPA · MORYA ♪", { fontFamily: "Georgia", fontSize: "14px", color: "#ffe39b", fontStyle: "bold", backgroundColor: "#071020cc", padding: { x: 10, y: 5 }, letterSpacing: 2 }).setOrigin(0.5).setVisible(false);
    this.add(this.chant); this.bringToTop(this.platform); this.bringToTop(this.chant);
    scene.add.existing(this);
    for (let i = 0; i < 460; i++) this.trail.push({ x, y: y + i });
  }

  private trailSample(distance: number) {
    let remaining = distance;
    for (let i = this.trail.length - 1; i > 0; i--) {
      const a = this.trail[i], b = this.trail[i - 1];
      const length = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      if (remaining <= length) {
        const t = length ? remaining / length : 0;
        return { x: Phaser.Math.Linear(a.x, b.x, t), y: Phaser.Math.Linear(a.y, b.y, t), angle: Math.atan2(a.y - b.y, a.x - b.x) };
      }
      remaining -= length;
    }
    const first = this.trail[0]; return { x: first.x, y: first.y, angle: -Math.PI / 2 };
  }

  setMoving(moving: boolean) {
    this.moving = moving; this.chant.setVisible(moving);
    if (!moving) this.walkers.forEach(({ sprite }) => sprite.setAngle(0));
  }

  updatePerformance(time: number) {
    const latest = this.trail[this.trail.length - 1];
    if (!latest || Phaser.Math.Distance.Between(latest.x, latest.y, this.x, this.y) > 2.5) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 520) this.trail.shift();
    }
    if (this.moving) this.stride += 0.16;
    this.walkers.forEach((walker, index) => {
      const sample = this.trailSample(walker.offset);
      const normalX = -Math.sin(sample.angle), normalY = Math.cos(sample.angle);
      const scale = this.scaleX || 1;
      const localX = (sample.x + normalX * walker.lateral - this.x) / scale;
      const localY = (sample.y + normalY * walker.lateral - this.y) / scale;
      const bounce = this.moving ? Math.abs(Math.sin(this.stride + index * 0.7)) * 5 : 0;
      walker.sprite.setPosition(localX, localY - bounce).setFlipX(Math.cos(sample.angle) < 0).setAngle(this.moving ? Math.sin(this.stride + index) * 2 : 0).setDepth(localY);
      walker.drum?.setPosition(localX, localY - 18 - bounce).setScale(1 + (this.moving ? Math.sin(time / 105 + index) * 0.08 : 0));
      walker.drum?.setDepth(localY + 1);
    });
    if (this.moving) {
      this.platform.setY(-Math.abs(Math.sin(this.stride * 0.45)) * 3);
      this.chant.setText(Math.floor(time / 620) % 2 ? "♪ MORYA! MORYA! ♪" : "♪ GANPATI BAPPA! ♪");
    } else this.platform.setY(0);
  }

  setLane(_visualX: number) {}
  setTilt(angle: number) { this.platform.setAngle(angle); }
  setFlowIntensity(intensity: number) { this.glow.setAlpha(0.12 + intensity * 0.24).setScale(0.85 + intensity * 0.35); }
}
