import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { VFXSystem } from './VFXSystem';
import type { Vec2 } from '@/types/game';

/** Real world objects: pickups, breakable carts and moving hazards share world coordinates. */
export class JourneyPlaySystem {
  score = 0;
  combo = 0;
  maxCombo = 0;
  hits = 0;
  private lastCollect = -10000;
  private invincibleUntil = 0;
  private pickups: Phaser.GameObjects.Star[] = [];
  private carts: Phaser.GameObjects.Container[] = [];
  private hazards: { body: Phaser.GameObjects.Ellipse; x: number; y: number; phase: number }[] = [];
  constructor(private scene: Phaser.Scene, points: Vec2[], private vfx: VFXSystem) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i], b = points[i + 1];
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const nx = -(b.y - a.y) / length, ny = (b.x - a.x) / length;
      for (let d = 25; d < length; d += 43) {
        const t = d / length, offset = Math.sin(d / 65 + i) * 36;
        const star = scene.add.star(a.x + (b.x - a.x) * t + nx * offset, a.y + (b.y - a.y) * t + ny * offset, 5, 5, 12, 0xffd05b).setStrokeStyle(2, 0xfff3bd).setDepth(2400);
        this.pickups.push(star);
        scene.tweens.add({ targets: star, angle: 180, duration: 2600, repeat: -1 });
      }
      if (i % 2 === 1) {
        const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
        const cart = scene.add.container(x, y).setDepth(y + 12);
        cart.add([scene.add.ellipse(0, 12, 64, 24, 0x000000, .25), scene.add.rectangle(0, 0, 52, 33, 0xb6753c).setStrokeStyle(3, 0xf1c777), scene.add.rectangle(0, -9, 54, 6, 0xe3b272), scene.add.circle(-21, 18, 7, 0x14202b), scene.add.circle(21, 18, 7, 0x14202b)]);
        this.carts.push(cart);
      }
      if (i % 3 === 2) {
        const x = b.x, y = b.y;
        this.hazards.push({ body: scene.add.ellipse(x, y, 46, 25, 0x4bbbd8, .65).setStrokeStyle(3, 0xb0eeff).setDepth(y + 8), x, y, phase: i });
      }
    }
  }
  update(time: number, player: Phaser.Physics.Arcade.Sprite, dashing: boolean) {
    if (time - this.lastCollect > 2300 && this.combo) { this.combo = 0; this.publish(); }
    for (const star of this.pickups) {
      if (!star.active || Phaser.Math.Distance.Between(player.x, player.y, star.x, star.y) > (dashing ? 65 : 35)) continue;
      this.combo++; this.maxCombo = Math.max(this.combo, this.maxCombo); this.lastCollect = time;
      const points = 25 * Math.min(5, 1 + Math.floor(this.combo / 5)); this.score += points;
      this.vfx.burstPetals(star.x, star.y, 8);
      this.vfx.scorePopup(star.x, star.y - 20, `+${points}`, 20, 0xffd66b);
      star.destroy(); EventBus.emit('ui-sfx', this.combo % 5 === 0 ? 'perfect' : 'good'); this.publish();
    }
    for (const cart of this.carts) {
      if (!cart.active || Phaser.Math.Distance.Between(player.x, player.y, cart.x, cart.y) > 42) continue;
      if (dashing) {
        this.score += 150; this.vfx.burstPetals(cart.x, cart.y, 28);
        this.vfx.scorePopup(cart.x, cart.y - 30, 'SMASH! +150', 24, 0x8ce8bd);
        cart.destroy(); this.scene.cameras.main.shake(90, .002); EventBus.emit('ui-sfx', 'perfect'); this.publish();
      } else this.hit(time, player);
    }
    for (const hazard of this.hazards) {
      hazard.body.x = hazard.x + Math.sin(time / 850 + hazard.phase) * 50;
      if (!dashing && Phaser.Math.Distance.Between(player.x, player.y, hazard.body.x, hazard.y) < 30) this.hit(time, player);
    }
  }
  private hit(time: number, player: Phaser.Physics.Arcade.Sprite) {
    if (time < this.invincibleUntil) return;
    this.invincibleUntil = time + 1300; this.hits++; this.combo = 0; this.score = Math.max(0, this.score - 50);
    this.scene.cameras.main.shake(160, .003);
    player.setTint(0xff8976); this.scene.time.delayedCall(350, () => player.clearTint());
    this.vfx.scorePopup(player.x, player.y - 40, 'OUCH −50 · DASH THROUGH', 16, 0xff9a7e);
    EventBus.emit('ui-sfx', 'wrong'); this.publish();
  }
  publish() { EventBus.emit('journey-score', this.score, this.combo); }
}
