import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { VFXSystem } from '../systems/VFXSystem';
import { AudioSystem } from '../systems/AudioSystem';

/**
 * MODAK CATCH — "Suika Merge" Sweet Stacking on a Thali
 *
 * Sweets fall from balconies onto Mooshak's silver thali.
 * Matching sweets merge into bigger ones!
 * Keep them balanced — don't let them spill over the rim!
 *
 * Sweet tiers:
 *   Boondi Laddu (small, yellow) → Besan Laddu (medium, orange)
 *   → Pedha (large, cream) → Golden Ukadiche Modak (huge, gold)
 *
 * Inspired by: Suika Game / Watermelon Game
 */

const THALI_WIDTH = 280;
const THALI_Y = 500;
const SPILL_LINE_Y = 360; // Above this = danger
const DROP_MIN_X = 160;
const DROP_MAX_X = 640;

interface Sweet {
  id: number;
  tier: number;
  body: Phaser.GameObjects.Container;
  radius: number;
  vx: number;
  vy: number;
  settled: boolean;
  merging: boolean;
}

const SWEET_TIERS = [
  { name: 'Boondi Laddu', radius: 14, color: 0xffcc44, score: 10 },
  { name: 'Besan Laddu', radius: 20, color: 0xff9933, score: 30 },
  { name: 'Pedha', radius: 28, color: 0xffeecc, score: 60 },
  { name: 'Ukadiche Modak', radius: 36, color: 0xffd700, score: 150 },
];

// Bad items
const HUSK_RADIUS = 16;
const HUSK_COLOR = 0x553322;

export class ModakCatchScene extends Phaser.Scene {
  private sweets: Sweet[] = [];
  private nextId = 0;
  private score = 0;
  private lives = 3;
  private dropX = 400;
  private dropReady = true;
  private nextTier = 0;
  private previewSweet?: Phaser.GameObjects.Container;
  private gameOver = false;
  private elapsed = 0;
  private spillTimer = 0;
  private combo = 0;
  private maxCombo = 0;
  private assisted = false;
  private dropCount = 0;

  // Systems
  private vfx!: VFXSystem;
  private audio!: AudioSystem;

  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private spillLine!: Phaser.GameObjects.Line;
  private thaliGraphic!: Phaser.GameObjects.Graphics;
  private dropGuide!: Phaser.GameObjects.Line;

  // Callbacks
  private onWinCallback?: (medal: string) => void;
  private onFailCallback?: () => void;

  constructor() {
    super({ key: 'ModakCatchScene' });
  }

  init(data: { onWin?: (medal: string) => void; onFail?: () => void; assisted?: boolean }) {
    this.onWinCallback = data.onWin;
    this.onFailCallback = data.onFail;
    this.assisted = data.assisted || false;
    this.sweets = [];
    this.nextId = 0;
    this.score = 0;
    this.lives = this.assisted ? 5 : 3;
    this.dropReady = true;
    this.nextTier = 0;
    this.gameOver = false;
    this.elapsed = 0;
    this.spillTimer = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.dropCount = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // === BACKGROUND === (Balcony scene)
    this.add.rectangle(0, 0, width, height, 0x1a1025).setOrigin(0);

    // Balcony railing at top
    const balconyG = this.add.graphics();
    balconyG.fillStyle(0x6a4a2a, 0.8);
    balconyG.fillRect(0, 0, width, 80);
    balconyG.fillStyle(0x8a6a3a, 0.9);
    balconyG.fillRect(0, 70, width, 15);
    // Railing posts
    for (let x = 30; x < width; x += 60) {
      balconyG.fillStyle(0x7a5a3a);
      // Flower pots
      balconyG.fillStyle(0x8b4513);
      balconyG.fillRect(x - 5, 30, 16, 15);
      balconyG.fillStyle(0x00aa00);
      balconyG.fillCircle(x + 3, 25, 8);
      // Hanging diyas
      balconyG.fillStyle(0xffaa00);
      balconyG.fillTriangle(x-5, 80, x+11, 80, x+3, 90);
      
      // NPCs tossing sweets
      if (x % 120 === 30) {
        balconyG.fillStyle(0xffccaa); // Head
        balconyG.fillCircle(x + 3, 15, 8);
        balconyG.lineStyle(2, 0xffffff); // Body
        balconyG.lineBetween(x + 3, 23, x + 3, 40);
        balconyG.lineBetween(x + 3, 28, x - 10, 20); // Arm tossing
      }
      balconyG.fillStyle(0x7a5a3a);
      balconyG.fillRect(x, 45, 6, 35);
    }

    // Festival banners hanging from balcony
    for (let x = 80; x < width; x += 120) {
      const banner = this.add.graphics();
      const bannerColor = [0xff6633, 0xffcc00, 0x33cc66][Math.floor(x / 120) % 3];
      banner.fillStyle(bannerColor, 0.6);
      banner.fillTriangle(x - 15, 80, x + 15, 80, x, 120);
      banner.setDepth(1);
    }

    // === SYSTEMS ===
    this.vfx = new VFXSystem(this);
    this.vfx.init();
    this.audio = new AudioSystem(this);
    this.audio.init();

    // === THALI (silver tray at bottom) ===
    this.thaliGraphic = this.add.graphics().setDepth(100);
    this.drawThali();

    // === SPILL LINE ===
    this.spillLine = this.add.line(0, 0, DROP_MIN_X, SPILL_LINE_Y, DROP_MAX_X, SPILL_LINE_Y, 0xff4444, 0.3)
      .setOrigin(0)
      .setDepth(200);

    this.add.text(DROP_MAX_X + 10, SPILL_LINE_Y - 8, 'SPILL!', {
      fontSize: '10px', color: '#ff4444', fontFamily: 'Arial',
    }).setDepth(200).setAlpha(0.5);

    // === DROP GUIDE ===
    this.dropGuide = this.add.line(0, 0, 400, 90, 400, THALI_Y, 0xffffff, 0.15)
      .setOrigin(0)
      .setDepth(199);

    // === PREVIEW SWEET ===
    this.createPreview();

    // === HUD ===
    this.scoreText = this.add.text(20, height - 40, 'SCORE: 0', {
      fontSize: '16px', color: '#ffd700', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setDepth(300);

    this.livesText = this.add.text(20, height - 20, '❤❤❤', {
      fontSize: '16px', color: '#ff4444', fontFamily: 'Arial',
    }).setDepth(300);

    this.comboText = this.add.text(width / 2, height - 40, '', {
      fontSize: '20px', color: '#ff8833', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(300);

    this.statusText = this.add.text(width / 2, 50, 'CATCH THE SWEETS! MATCH TO MERGE!', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(300);

    // Target display
    this.add.text(width - 20, height - 40, 'TARGET: 500 pts', {
      fontSize: '12px', color: '#aaaaaa', fontFamily: 'Arial',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(300);

    // === INPUT ===
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      this.dropX = Phaser.Math.Clamp(p.x, DROP_MIN_X + 30, DROP_MAX_X - 30);
    });

    this.input.on('pointerdown', () => this.dropSweet());

    this.input.keyboard!.on('keydown-SPACE', () => this.dropSweet());

    // Left/right to aim
    this.input.keyboard!.on('keydown-LEFT', () => { this.dropX = Math.max(DROP_MIN_X + 30, this.dropX - 20); });
    this.input.keyboard!.on('keydown-RIGHT', () => { this.dropX = Math.min(DROP_MAX_X - 30, this.dropX + 20); });
    this.input.keyboard!.on('keydown-A', () => { this.dropX = Math.max(DROP_MIN_X + 30, this.dropX - 20); });
    this.input.keyboard!.on('keydown-D', () => { this.dropX = Math.min(DROP_MAX_X - 30, this.dropX + 20); });

    // Camera fade in
    this.cameras.main.fadeIn(400);


    
    // Auto-drop timer (sweets fall from balcony automatically too)
    this.time.addEvent({
      delay: this.assisted ? 3000 : 2000,
      loop: true,
      callback: () => {
        if (!this.gameOver && this.dropReady) {
          this.dropSweet();
        }
      },
    });

    this.events.once('shutdown', () => {
      this.vfx.destroy();
      this.audio.destroy();
    });
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return;
    this.elapsed += delta / 1000;

    // Update preview position
    if (this.previewSweet) {
      this.previewSweet.setPosition(this.dropX, 90);
    }

    // Update drop guide
    this.dropGuide.setTo(this.dropX, 90, this.dropX, THALI_Y);

    // === PHYSICS UPDATE (simplified gravity + collision) ===
    let gravity = 0.3;
    if (this.score >= 200) gravity = 0.45;
    
    let thaliScale = 1;
    if (this.score >= 450) thaliScale = 0.8;
    const currentThaliWidth = THALI_WIDTH * thaliScale;
    
    const thaliLeft = 400 - currentThaliWidth / 2;
    const thaliRight = 400 + currentThaliWidth / 2;
    
    this.thaliGraphic.setScale(thaliScale, 1);
    
    const friction = 0.95;
    

    for (const sweet of this.sweets) {
      if (sweet.merging) continue;

      // Gravity
      sweet.vy += gravity;

      // Move
      const newX = sweet.body.x + sweet.vx;
      const newY = sweet.body.y + sweet.vy;

      // Thali floor collision
      if (newY + sweet.radius >= THALI_Y) {
        sweet.body.y = THALI_Y - sweet.radius;
        sweet.vy *= -0.3; // bounce
        if (Math.abs(sweet.vy) < 0.5) {
          sweet.vy = 0;
          sweet.settled = true;
        }
        sweet.vx *= friction;
      } else {
        sweet.body.y = newY;
      }

      // Thali wall collision
      if (sweet.body.x - sweet.radius < thaliLeft) {
        sweet.body.x = thaliLeft + sweet.radius;
        sweet.vx = Math.abs(sweet.vx) * 0.5;
      }
      if (sweet.body.x + sweet.radius > thaliRight) {
        sweet.body.x = thaliRight - sweet.radius;
        sweet.vx = -Math.abs(sweet.vx) * 0.5;
      }

      sweet.body.x += sweet.vx;
      sweet.vx *= friction;
    }

    // === SWEET-SWEET COLLISION & MERGE CHECK ===
    for (let i = 0; i < this.sweets.length; i++) {
      for (let j = i + 1; j < this.sweets.length; j++) {
        const a = this.sweets[i];
        const b = this.sweets[j];
        if (a.merging || b.merging) continue;

        const dist = Phaser.Math.Distance.Between(a.body.x, a.body.y, b.body.x, b.body.y);
        const minDist = a.radius + b.radius;

        if (dist < minDist) {
          // Push apart
          const overlap = minDist - dist;
          const nx = (b.body.x - a.body.x) / (dist || 1);
          const ny = (b.body.y - a.body.y) / (dist || 1);
          a.body.x -= nx * overlap * 0.5;
          a.body.y -= ny * overlap * 0.5;
          b.body.x += nx * overlap * 0.5;
          b.body.y += ny * overlap * 0.5;

          // Transfer momentum
          const relVx = a.vx - b.vx;
          a.vx -= relVx * 0.5;
          b.vx += relVx * 0.5;

          // MERGE CHECK: same tier and not max tier
          if (a.tier === b.tier && a.tier < SWEET_TIERS.length - 1) {
            this.mergeSweets(a, b);
          }
        }
      }
    }

    // === SPILL CHECK ===
    let anyAboveLine = false;
    for (const sweet of this.sweets) {
      if (!sweet.merging && sweet.settled && sweet.body.y - sweet.radius < SPILL_LINE_Y) {
        anyAboveLine = true;
        break;
      }
    }

    if (anyAboveLine) {
      this.spillTimer += delta / 1000;
      this.spillLine.setStrokeStyle(2, 0xff4444, 0.5 + Math.sin(this.spillTimer * 8) * 0.3);
      if (this.spillTimer >= 3) {
        this.loseLife('Sweets spilled over the thali!');
        this.spillTimer = 0;
      }
    } else {
      this.spillTimer = Math.max(0, this.spillTimer - delta / 1000 * 2);
      this.spillLine.setStrokeStyle(1, 0xff4444, 0.2);
    }

    // === WIN CHECK ===
    const winTarget = this.assisted ? 300 : 500;
    if (this.score >= winTarget) {
      this.endGame(true);
    }

    // Clean up merged sweets
    this.sweets = this.sweets.filter(s => !s.merging);
  }

  // === CORE MECHANICS ===

  private dropSweet() {
    if (!this.dropReady || this.gameOver) return;
    this.dropReady = false;

    const tier = this.nextTier;
    const cfg = SWEET_TIERS[tier];
    const sweet = this.createSweetSprite(this.dropX, 90, tier);

    this.sweets.push(sweet);
    this.dropCount++;

    // Sometimes drop a husk (bad item) after several drops
    if (this.dropCount > 5 && Math.random() > 0.7 && !this.assisted) {
      this.time.delayedCall(800, () => this.dropHusk());
    }

    this.audio.playFootstep();

    // Next sweet preview
    this.nextTier = Math.random() > 0.7 ? 1 : 0; // Mostly tier 0, sometimes tier 1
    this.time.delayedCall(600, () => {
      this.dropReady = true;
      this.createPreview();
      // Drop two?
      if (this.score >= 350 && Math.random() > 0.5 && !this.assisted) {
         this.time.delayedCall(200, () => {
            const oldX = this.dropX;
            this.dropX = this.dropX + (Math.random()>0.5?40:-40);
            this.dropSweet();
            this.dropX = oldX;
         });
      }
    });
  }

  private dropHusk() {
    const huskX = Phaser.Math.Between(DROP_MIN_X + 40, DROP_MAX_X - 40);
    const container = this.add.container(huskX, 60);

    const body = this.add.circle(0, 0, HUSK_RADIUS, HUSK_COLOR);
    container.add(body);

    // Spikes
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const spike = this.add.triangle(
        Math.cos(a) * HUSK_RADIUS, Math.sin(a) * HUSK_RADIUS,
        -3, 0, 3, 0, 0, -6,
        0x442211
      ).setRotation(a);
      container.add(spike);
    }

    const label = this.add.text(0, 0, '✕', {
      fontSize: '14px', color: '#ff0000', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(label);

    // Warning text above husk
    const warning = this.add.text(0, -HUSK_RADIUS - 12, '⚠ TAP TO SWAT!', {
      fontSize: '9px', color: '#ff4444', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(warning);

    container.setDepth(500);

    // Make husk interactive — player can swat it away!
    body.setInteractive({ useHandCursor: true });
    body.on('pointerdown', () => {
      // Swatted! Remove without damage
      this.vfx.burstSparks(container.x, container.y, 6);
      this.vfx.scorePopup(container.x, container.y - 20, 'SWATTED!', 12, 0x44cc44);
      this.audio.playImpact();
      container.destroy();
      huskTween.destroy();
    });

    // Slow fall — gives player time to react
    const huskTween = this.tweens.add({
      targets: container,
      y: THALI_Y - HUSK_RADIUS,
      duration: 1500, // Slower than before (was 800)
      ease: 'Power1',
      onComplete: () => {
        // Hit the thali — damage!
        this.loseLife('Spiked husk hit the thali!');
        this.vfx.burstSparks(container.x, container.y, 8);
        this.cameras.main.shake(150, 0.005);
        // Remove husk
        this.tweens.add({
          targets: container,
          alpha: 0, y: container.y + 50,
          duration: 300,
          onComplete: () => container.destroy(),
        });
      },
    });
  }

  private createSweetSprite(x: number, y: number, tier: number): Sweet {
    const cfg = SWEET_TIERS[tier];
    const container = this.add.container(x, y);

    // Sweet body (circle with gradient look)
    // Complex sweet drawing
    let body;
    if (tier === 0) {
      // Boondi
      body = this.add.container(0,0);
      body.add(this.add.circle(0, 0, cfg.radius, cfg.color));
      body.add(this.add.circle(-4, -4, cfg.radius*0.4, 0xffa500));
      body.add(this.add.circle(4, 2, cfg.radius*0.4, 0xffa500));
      body.add(this.add.circle(-2, 4, cfg.radius*0.4, 0xffa500));
    } else if (tier === 1) {
      // Besan pentagon
      body = this.add.polygon(0, 0, [[0,-cfg.radius], [cfg.radius, -cfg.radius*0.3], [cfg.radius*0.6, cfg.radius], [-cfg.radius*0.6, cfg.radius], [-cfg.radius, -cfg.radius*0.3]], cfg.color);
    } else if (tier === 2) {
      // Pedha diamond
      body = this.add.polygon(0, 0, [[0,-cfg.radius], [cfg.radius, 0], [0, cfg.radius], [-cfg.radius, 0]], cfg.color);
    } else {
      // Golden Modak star
      body = this.add.star(0, 0, 5, cfg.radius*0.5, cfg.radius, cfg.color);
      body.setPostPipeline('GlowFilter'); // Fake glow
    }
    container.add(body);

    // Highlight
    const highlight = this.add.circle(-cfg.radius * 0.2, -cfg.radius * 0.2, cfg.radius * 0.3, 0xffffff, 0.3);
    container.add(highlight);

    // Label
    const label = this.add.text(0, 0, cfg.name.charAt(0), {
      fontSize: `${Math.max(10, cfg.radius - 4)}px`,
      color: '#1a1a2e',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(label);

    container.setDepth(400);

    return {
      id: this.nextId++,
      tier,
      body: container,
      radius: cfg.radius,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      settled: false,
      merging: false,
    };
  }

  private mergeSweets(a: Sweet, b: Sweet) {
    a.merging = true;
    b.merging = true;
    
    // Golden thread
    const thread = this.add.line(0, 0, a.body.x, a.body.y, b.body.x, b.body.y, 0xffd700, 1).setOrigin(0);
    this.tweens.add({
      targets: thread,
      alpha: 0,
      duration: 150,
      onComplete: () => thread.destroy()
    });
    this.cameras.main.flash(50, 255, 215, 0);

    const midX = (a.body.x + b.body.x) / 2;
    const midY = (a.body.y + b.body.y) / 2;
    const newTier = a.tier + 1;
    const cfg = SWEET_TIERS[newTier];

    // Merge animation
    this.tweens.add({
      targets: [a.body, b.body],
      x: midX, y: midY,
      scaleX: 0, scaleY: 0,
      duration: 150,
      onComplete: () => {
        a.body.destroy();
        b.body.destroy();

        // Create merged sweet
        const merged = this.createSweetSprite(midX, midY, newTier);
        this.sweets.push(merged);

        // Scale up animation
        merged.body.setScale(0.3);
        this.tweens.add({
          targets: merged.body,
          scaleX: 1, scaleY: 1,
          duration: 200,
          ease: 'Back.easeOut',
        });

        // VFX
        this.vfx.burstSparks(midX, midY, 12);
        this.vfx.burstPetals(midX, midY, 6);

        // Score
        this.score += cfg.score;
        
        // Milestones
        if (this.score >= 100 && this.score - cfg.score < 100) this.vfx.scorePopup(400, 300, 'MADHAV HALWAI IS IMPRESSED!', 24, 0xffd700);
        if (this.score >= 200 && this.score - cfg.score < 200) this.vfx.scorePopup(400, 300, 'AMAZING BALANCING!', 24, 0xffd700);
        if (this.score >= 300 && this.score - cfg.score < 300) this.vfx.scorePopup(400, 300, 'SWEET MASTER!', 24, 0xffd700);
        if (this.score >= 400 && this.score - cfg.score < 400) this.vfx.scorePopup(400, 300, 'ALMOST THERE!', 24, 0xffd700);

        this.scoreText.setText(`SCORE: ${this.score}`);
        this.vfx.scorePopup(midX, midY - 20, `+${cfg.score} ${cfg.name}!`, 14, cfg.color);

        // Combo
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        if (this.combo > 1) {
          this.comboText.setText(`${this.combo}× MERGE COMBO!`);
          this.comboText.setAlpha(1);
          this.tweens.add({
            targets: this.comboText,
            alpha: 0,
            duration: 1500,
            delay: 500,
          });
        }

        // Sound — ascending pitch for each tier
        EventBus.emit('ui-sfx', newTier >= 3 ? 'perfect' : 'good');

        // Hit-stop for big merges
        if (newTier >= 2) {
          this.cameras.main.shake(80, 0.003);
          // Brief freeze
          const originalTimeScale = this.time.timeScale;
          this.time.timeScale = 0.1;
          this.time.delayedCall(50, () => { this.time.timeScale = originalTimeScale; });
        }

        // Golden Modak — huge celebration!
        if (newTier === SWEET_TIERS.length - 1) {
          this.cameras.main.flash(300, 255, 215, 0);
          this.statusText.setText('✦ GOLDEN MODAK! ✦').setColor('#ffd700');
          this.vfx.burstFireworks(midX, midY);
        }
      },
    });

    // Reset combo timer
    this.time.delayedCall(2000, () => {
      if (this.combo > 0) this.combo = 0;
    });
  }

  private loseLife(reason: string) {
    this.lives--;
    this.livesText.setText('❤'.repeat(this.lives) + '♡'.repeat((this.assisted ? 5 : 3) - this.lives));
    this.statusText.setText(reason).setColor('#ff4444');
    this.cameras.main.shake(100, 0.004);
    EventBus.emit('ui-sfx', 'wrong');

    // Clear the HIGHEST sweets (near spill line) to prevent impossible states
    if (this.sweets.length > 6) {
      const sorted = [...this.sweets].filter(s => !s.merging).sort((a, b) => a.body.y - b.body.y);
      const toRemove = sorted.slice(0, 2);
      for (const s of toRemove) {
        const idx = this.sweets.indexOf(s);
        if (idx >= 0) this.sweets.splice(idx, 1);
        s.merging = true;
        this.tweens.add({
          targets: s.body,
          alpha: 0, y: s.body.y + 50,
          duration: 300,
          onComplete: () => s.body.destroy(),
        });
      }
    }

    if (this.lives <= 0) {
      this.endGame(false);
    } else {
      this.time.delayedCall(1500, () => {
        this.statusText.setText('KEEP CATCHING!').setColor('#ffffff');
      });
    }
  }

  private createPreview() {
    if (this.previewSweet) this.previewSweet.destroy();

    const cfg = SWEET_TIERS[this.nextTier];
    this.previewSweet = this.add.container(this.dropX, 90);

    const body = this.add.circle(0, 0, cfg.radius, cfg.color, 0.5);
    this.previewSweet.add(body);

    const label = this.add.text(0, cfg.radius + 8, 'TAP / SPACE', {
      fontSize: '8px', color: '#ffffff', fontFamily: 'Arial',
    }).setOrigin(0.5);
    this.previewSweet.add(label);

    this.previewSweet.setDepth(500);

    // Gentle pulse
    this.tweens.add({
      targets: this.previewSweet,
      scaleX: 1.1, scaleY: 1.1,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });
  }

  private drawThali() {
    const g = this.thaliGraphic;
    g.clear();

    const cx = 400;
    const left = cx - THALI_WIDTH / 2;
    const right = cx + THALI_WIDTH / 2;

    // Thali base (silver tray)
    g.fillStyle(0xc0c0c0, 0.8);
    g.fillRoundedRect(left, THALI_Y - 5, THALI_WIDTH, 20, 5);

    // Thali rim (raised edge)
    g.lineStyle(3, 0xe0e0e0, 0.9);
    g.lineBetween(left, THALI_Y, left, THALI_Y - 80);
    g.lineBetween(right, THALI_Y, right, THALI_Y - 80);

    // Decorative rim pattern
    g.lineStyle(1, 0xffd700, 0.5);
    g.lineBetween(left + 2, THALI_Y - 5, left + 2, THALI_Y - 80);
    g.lineBetween(right - 2, THALI_Y - 5, right - 2, THALI_Y - 80);

    // Label
    g.fillStyle(0xffffff, 0.4);
  }

  private endGame(won: boolean) {
    if (this.gameOver) return;
    this.gameOver = true;

    if (won) {
      this.audio.playStageClear();
      this.cameras.main.flash(200, 255, 215, 0);
      this.statusText.setText('✦ OFFERINGS COMPLETE! ✦').setColor('#ffd700');

      const medal = this.assisted ? 'ASSISTED'
        : this.maxCombo >= 5 ? 'GOLD'
        : this.maxCombo >= 3 ? 'SILVER'
        : 'BRONZE';

      this.time.delayedCall(1500, () => {
        if (this.onWinCallback) this.onWinCallback(medal);
      });
    } else {
      this.audio.playHurt();
      this.cameras.main.shake(400, 0.008);
      this.statusText.setText('THE SWEETS ARE LOST!').setColor('#ff4444');

      this.time.delayedCall(1500, () => {
        if (this.onFailCallback) this.onFailCallback();
      });
    }
  }
}
