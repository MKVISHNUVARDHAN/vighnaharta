import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { VFXSystem } from '../systems/VFXSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { TutorialOverlay } from '../systems/TutorialOverlay';

/**
 * ROAD RALLY v3 — "Car Jam" Physics Pushing Puzzle
 * 
 * The street is jammed with carts, crates, and barricades.
 * Mooshak pushes them to slide on momentum physics.
 * Shoving a cart into a side alley clears it.
 * Clear all carts before the Ganesha Rath arrives!
 * 
 * Inspired by: Car Jam, Rush Hour, Push Push Cat
 */

const CELL_SIZE = 64;
const GRID_W = 10;
const GRID_H = 12;
const OFFSET_X = 200;
const OFFSET_Y = 60;

type Direction = 'horizontal' | 'vertical';

interface CartData {
  id: number;
  gx: number;
  gy: number;
  width: number;  // in cells
  height: number; // in cells
  direction: Direction;
  sprite: Phaser.GameObjects.Container;
  cleared: boolean;
  color: number;
}

interface ExitZone {
  gx: number;
  gy: number;
  side: 'left' | 'right' | 'top' | 'bottom';
}

export class RoadRallyScene extends Phaser.Scene {
  private minimapBg!: Phaser.GameObjects.Rectangle;
  private minimapG!: Phaser.GameObjects.Graphics;
  private audioCtx!: AudioContext;
  private rumbleOsc!: OscillatorNode;
  private rumbleGain!: GainNode;
  // Game state
  private carts: CartData[] = [];
  private mooshakGX = 5;
  private mooshakGY = 10;
  private mooshak!: Phaser.GameObjects.Sprite;
  private mooshakShadow!: Phaser.GameObjects.Ellipse;
  private totalCarts = 0;
  private clearedCount = 0;
  private rath!: Phaser.GameObjects.Container;
  private rathGY = GRID_H + 7; // Starts far enough away for a readable first attempt
  private rathSpeed = 0.085; // cells per second; deliberately frame-rate independent
  private gameOver = false;
  private elapsed = 0;
  private moves = 0;
  private assisted = false;

  // Exits
  private exits: ExitZone[] = [];

  // Systems
  private vfx!: VFXSystem;
  private audio!: AudioSystem;

  // UI
  private statusText!: Phaser.GameObjects.Text;
  private rathWarning!: Phaser.GameObjects.Text;
  private cartCountText!: Phaser.GameObjects.Text;

  // Callbacks
  private onWinCallback?: (medal: string) => void;
  private onFailCallback?: () => void;

  constructor() {
    super({ key: 'RoadRallyScene' });
  }

  init(data: { onWin?: (medal: string) => void; onFail?: () => void; assisted?: boolean }) {
    this.onWinCallback = data.onWin;
    this.onFailCallback = data.onFail;
    this.assisted = data.assisted || false;
    this.carts = [];
    this.clearedCount = 0;
    this.moves = 0;
    this.gameOver = false;
    this.elapsed = 0;
    this.rathGY = GRID_H + 7;
    this.mooshakGX = 5;
    this.mooshakGY = 10;
    this.rathSpeed = this.assisted ? 0.055 : 0.085;
  }

  create() {
    const { width, height } = this.cameras.main;

    // === BACKGROUND ===
    this.add.rectangle(0, 0, width, height, 0x1a1535).setOrigin(0);

    // === SYSTEMS ===
    this.vfx = new VFXSystem(this);
    this.vfx.init();
    this.audio = new AudioSystem(this);
    this.audio.init();

    // === DRAW GRID (the street) ===
    this.drawGrid();

    // === EXITS (side alleys) ===
    this.exits = [
      { gx: -1, gy: 3, side: 'left' },
      { gx: -1, gy: 7, side: 'left' },
      { gx: GRID_W, gy: 2, side: 'right' },
      { gx: GRID_W, gy: 5, side: 'right' },
      { gx: GRID_W, gy: 9, side: 'right' },
      { gx: 4, gy: -1, side: 'top' },
    ];

    this.drawExits();

    // === PLACE CARTS ===
    this.generatePuzzle();

    // === MOOSHAK ===
    const mPos = this.gridToScreen(this.mooshakGX, this.mooshakGY);
    this.mooshakShadow = this.add.ellipse(mPos.x, mPos.y + 10, 30, 12, 0x000000, 0.3).setDepth(9998);
    this.mooshak = this.add.sprite(mPos.x, mPos.y, 'mooshak-run-v1', 0)
      .setScale(0.12)
      .setOrigin(0.5, 0.8)
      .setDepth(9999);

    if (!this.anims.exists('mooshak-run')) {
      this.anims.create({
        key: 'mooshak-run',
        frames: this.anims.generateFrameNumbers('mooshak-run-v1', { start: 0, end: 7 }),
        frameRate: 14,
        repeat: -1,
      });
    }

    // Rumble audio context
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.rumbleOsc = this.audioCtx.createOscillator();
    this.rumbleGain = this.audioCtx.createGain();
    this.rumbleOsc.type = 'sine';
    this.rumbleOsc.frequency.setValueAtTime(40, this.audioCtx.currentTime);
    this.rumbleGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.rumbleOsc.connect(this.rumbleGain);
    this.rumbleGain.connect(this.audioCtx.destination);
    this.rumbleOsc.start();
    
    // === RATH (approaching from bottom) ===
    this.createRath();

    // === HUD ===
    this.statusText = this.add.text(width / 2, 20, 'PUSH CARTS INTO THE SIDE ALLEYS!', {
      fontSize: '16px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10000);

    this.cartCountText = this.add.text(width - 20, 20, `CARTS: 0/${this.totalCarts}`, {
      fontSize: '14px', color: '#ffd700', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(10000);

    this.rathWarning = this.add.text(width / 2, height - 30, '', {
      fontSize: '14px', color: '#ff4444', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10000);

    // === MINI-MAP ===
    this.minimapBg = this.add.rectangle(width - 70, 70, 100, 120, 0x000000, 0.5).setDepth(10000);
    this.minimapG = this.add.graphics().setDepth(10001);
    
    // === INPUT ===
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (this.gameOver) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.tryMove(0, -1);
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.tryMove(0, 1);
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.tryMove(-1, 0);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.tryMove(1, 0);
    });

    // Touch D-pad
    this.createDPad();

    // Camera fade in
    this.cameras.main.fadeIn(400);

    const tutorial = new TutorialOverlay(this);
    tutorial.show({
      title: 'ROAD RALLY',
      objective: 'Push all carts into side alleys before the Rath arrives!',
      controls: [
        { key: 'WASD / ↑↓←→', action: 'Move Mooshak' },
        { key: 'PUSH', action: 'Walk into carts to push them' }
      ],
      tips: [
        'Carts slide along their direction (horizontal or vertical)',
        'Look for green EXIT arrows on the edges',
        'The sacred Rath is approaching from below — hurry!'
      ],
      accentColor: 0xf2b84b
    });

    // Start message
    this.time.delayedCall(500, () => {
      this.statusText.setText('CLEAR THE ROAD! THE RATH IS COMING!');
      this.audio.playDashStart();
    });

    this.events.once('shutdown', () => {
      this.vfx.destroy();
      if (this.audioCtx) this.audioCtx.close();
      this.audio.destroy();
    });
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return;
    this.elapsed += delta / 1000;

    // === ADVANCE THE RATH ===
    // Phase difficulty
    let speedMult = 1;
    if (this.clearedCount >= 4 && this.clearedCount < 7) {
      speedMult = 1.5;
    } else if (this.clearedCount >= 7) {
      speedMult = 2;
      // Pulse screen edges red
      this.cameras.main.flash(100, 255, 0, 0);
    }
    this.rathGY -= this.rathSpeed * speedMult * (delta / 1000);
    const rathScreenPos = this.gridToScreen(GRID_W / 2, this.rathGY);
    this.rath.setPosition(rathScreenPos.x, rathScreenPos.y);
    this.rath.setDepth(rathScreenPos.y + 100);
    
    // Update minimap
    if (this.minimapG) {
      this.minimapG.clear();
      const mw = 100, mh = 120;
      const mx = this.cameras.main.width - 120;
      const my = 10;
      
      // Draw mooshak
      this.minimapG.fillStyle(0xffffff, 1);
      this.minimapG.fillRect(mx + (this.mooshakGX/GRID_W)*mw, my + (this.mooshakGY/GRID_H)*mh, 5, 5);
      
      // Draw rath
      this.minimapG.fillStyle(0xff8800, 1);
      this.minimapG.fillRect(mx, my + (this.rathGY/GRID_H)*mh, mw, 5);
      
      // Draw carts
      this.carts.forEach(c => {
        if (!c.cleared) {
          this.minimapG.fillStyle(c.color, 1);
          this.minimapG.fillRect(mx + (c.gx/GRID_W)*mw, my + (c.gy/GRID_H)*mh, (c.width/GRID_W)*mw, (c.height/GRID_H)*mh);
        }
      });
    }
    // Update rumble gain based on distance
    const distToMooshak = Math.abs(this.rathGY - this.mooshakGY);
    const gain = Math.max(0, 1 - (distToMooshak / 12));
    if (this.rumbleGain) this.rumbleGain.gain.setValueAtTime(gain * 0.5, this.audioCtx.currentTime);

    // Warning intensity
    const distanceToJam = Math.max(0, this.rathGY - (GRID_H + 0.5));
    const danger = Phaser.Math.Clamp(1 - distanceToJam / 6, 0, 1);
    if (danger > 0.3) {
      this.rathWarning.setText(`⚠ RATH APPROACHING · ${Math.ceil(distanceToJam / this.rathSpeed)}s`);
      this.rathWarning.setAlpha(0.5 + danger * 0.5);
      if (danger > 0.7 && Math.random() > 0.95) {
        this.cameras.main.shake(80, 0.002);
      }
    }

    // === FAIL: Rath reaches the grid ===
    if (this.rathGY <= GRID_H + 0.5) {
      this.endGame(false);
    }

    // === WIN: All carts cleared ===
    if (this.clearedCount >= this.totalCarts) {
      this.endGame(true);
    }
  }

  // === CORE MECHANICS ===

  private gridToScreen(gx: number, gy: number): { x: number; y: number } {
    return {
      x: OFFSET_X + gx * CELL_SIZE + CELL_SIZE / 2,
      y: OFFSET_Y + gy * CELL_SIZE + CELL_SIZE / 2,
    };
  }

  private tryMove(dx: number, dy: number) {
    const newGX = this.mooshakGX + dx;
    const newGY = this.mooshakGY + dy;

    // Check bounds
    if (newGX < 0 || newGY < 0 || newGX >= GRID_W || newGY >= GRID_H) return;

    // Check if cart is in the way
    const cart = this.getCartAt(newGX, newGY);
    if (cart) {
      // Try to push the cart
      if (this.pushCart(cart, dx, dy)) {
        // Move succeeded (cart pushed)
        this.mooshakGX = newGX;
        this.mooshakGY = newGY;
        this.moves++;
        this.animateMooshak(dx, dy);
        this.audio.playFootstep();
      } else {
        // Can't push — blocked
        this.vfx.screenPunch(dx * 3, dy * 3);
        this.cameras.main.shake(50, 0.002);
      }
      return;
    }

    // Empty cell — just walk
    this.mooshakGX = newGX;
    this.mooshakGY = newGY;
    this.animateMooshak(dx, dy);
    this.audio.playFootstep();
  }

  private pushCart(cart: CartData, dx: number, dy: number): boolean {
    if (cart.cleared) return false;

    // Cart can only be pushed along its direction
    if (cart.direction === 'horizontal' && dy !== 0) return false;
    if (cart.direction === 'vertical' && dx !== 0) return false;

    // Check if the path ahead is clear for the entire cart
    // First pass: check ALL leading-edge cells for blockers
    let allCellsExiting = true;
    for (let i = 0; i < (dx !== 0 ? cart.height : cart.width); i++) {
      let checkX: number, checkY: number;
      if (dx > 0) {
        checkX = cart.gx + cart.width; // rightmost + 1
        checkY = cart.gy + i;
      } else if (dx < 0) {
        checkX = cart.gx - 1;
        checkY = cart.gy + i;
      } else if (dy > 0) {
        checkY = cart.gy + cart.height; // bottom + 1
        checkX = cart.gx + i;
      } else {
        checkY = cart.gy - 1;
        checkX = cart.gx + i;
      }

      // Check if this cell reaches an exit
      if (!this.isExitZone(checkX, checkY, dx, dy)) {
        allCellsExiting = false;
      }

      // Check bounds (if not exiting)
      if (!this.isExitZone(checkX, checkY, dx, dy)) {
        if (checkX < 0 || checkY < 0 || checkX >= GRID_W || checkY >= GRID_H) return false;

        // Check if another cart blocks
        const blocker = this.getCartAt(checkX, checkY);
        if (blocker && blocker.id !== cart.id) return false;
      }
    }

    // If at least one cell exits and none are blocked, clear the cart
    if (allCellsExiting) {
      this.clearCart(cart, dx, dy);
      return true;
    }

    // Move the cart one cell
    cart.gx += dx;
    cart.gy += dy;
    this.moves++;

    // Animate cart sliding
    const newPos = this.gridToScreen(cart.gx + (cart.width - 1) / 2, cart.gy + (cart.height - 1) / 2);
    this.tweens.add({
      targets: cart.sprite,
      x: newPos.x, y: newPos.y,
      duration: 120,
      ease: 'Power2',
      onComplete: () => {
        this.vfx.dustPuff(newPos.x, newPos.y + 10);
      },
    });

    this.audio.playImpact();
    return true;
  }

  private clearCart(cart: CartData, dx: number, dy: number) {
    cart.cleared = true;
    this.clearedCount++;

    // Slide cart off screen
    const exitX = cart.sprite.x + dx * 400;
    const exitY = cart.sprite.y + dy * 400;

    this.tweens.add({
      targets: cart.sprite,
      x: exitX, y: exitY,
      alpha: 0,
      duration: 400,
      ease: 'Power3',
      onComplete: () => cart.sprite.destroy(),
    });

    // Celebration!
    this.vfx.burstSparks(cart.sprite.x, cart.sprite.y, 15);
    this.vfx.burstPetals(cart.sprite.x, cart.sprite.y, 10);
    this.audio.playStageClear();
    this.cameras.main.shake(100, 0.003);

    // Hit-stop effect (freeze for 60ms)
    this.physics.world.pause();
    this.time.timeScale = 0.05;
    this.time.delayedCall(60, () => {
      this.physics.world.resume();
      this.time.timeScale = 1;
    });

    // Score popup
    this.vfx.scorePopup(cart.sprite.x, cart.sprite.y - 20, `CLEARED! ${this.clearedCount}/${this.totalCarts}`, 18, 0xffd700);
    // Devotees cheer
    const cheers = ['Shabash!', 'Morya!', 'Ganpati Bappa Morya!'];
    const cheer = cheers[Math.floor(Math.random() * cheers.length)];
    const cx = exitX < OFFSET_X ? exitX - 50 : exitX + 50;
    this.vfx.scorePopup(cx, exitY - 50, cheer, 16, 0xffffff);

    // Update count
    this.cartCountText.setText(`CARTS: ${this.clearedCount}/${this.totalCarts}`);

    // Status feedback
    if (this.clearedCount === this.totalCarts - 1) {
      this.statusText.setText('ONE MORE! HURRY!');
      this.statusText.setColor('#ff4444');
    } else {
      this.statusText.setText(`${this.totalCarts - this.clearedCount} CARTS LEFT!`);
    }
  }

  private isExitZone(gx: number, gy: number, dx: number, dy: number): boolean {
    for (const exit of this.exits) {
      if (dx < 0 && exit.side === 'left' && gx <= exit.gx && Math.abs(gy - exit.gy) <= 1) return true;
      if (dx > 0 && exit.side === 'right' && gx >= exit.gx && Math.abs(gy - exit.gy) <= 1) return true;
      if (dy < 0 && exit.side === 'top' && gy <= exit.gy && Math.abs(gx - exit.gx) <= 1) return true;
      if (dy > 0 && exit.side === 'bottom' && gy >= exit.gy && Math.abs(gx - exit.gx) <= 1) return true;
    }
    return false;
  }

  private getCartAt(gx: number, gy: number): CartData | undefined {
    return this.carts.find(c =>
      !c.cleared &&
      gx >= c.gx && gx < c.gx + c.width &&
      gy >= c.gy && gy < c.gy + c.height
    );
  }

  private animateMooshak(dx: number, dy: number) {
    const pos = this.gridToScreen(this.mooshakGX, this.mooshakGY);

    // Flip based on direction
    if (dx < 0) this.mooshak.setFlipX(true);
    if (dx > 0) this.mooshak.setFlipX(false);

    this.mooshak.play('mooshak-run', true);

    this.tweens.add({
      targets: this.mooshak,
      x: pos.x, y: pos.y,
      duration: 100,
      ease: 'Power2',
      onComplete: () => this.mooshak.stop().setFrame(0),
    });

    this.tweens.add({
      targets: this.mooshakShadow,
      x: pos.x, y: pos.y + 10,
      duration: 100,
    });

    // Squash-stretch on movement
    this.tweens.add({
      targets: this.mooshak,
      scaleX: dx !== 0 ? 0.14 : 0.10,
      scaleY: dx !== 0 ? 0.10 : 0.14,
      duration: 50,
      yoyo: true,
      onComplete: () => this.mooshak.setScale(0.12),
    });
  }

  // === PUZZLE GENERATION ===

  private generatePuzzle() {
    const cartConfigs = [
      // Main obstacles on the road
      { gx: 2, gy: 2, w: 3, h: 1, dir: 'horizontal' as Direction, color: 0x8B4513 },
      { gx: 6, gy: 4, w: 1, h: 2, dir: 'vertical' as Direction, color: 0xcc4444 },
      { gx: 1, gy: 5, w: 2, h: 1, dir: 'horizontal' as Direction, color: 0xdd8833 },
      { gx: 4, gy: 6, w: 1, h: 3, dir: 'vertical' as Direction, color: 0x44aa44 },
      { gx: 7, gy: 7, w: 2, h: 1, dir: 'horizontal' as Direction, color: 0x4488cc },
      { gx: 1, gy: 8, w: 3, h: 1, dir: 'horizontal' as Direction, color: 0xaa44aa },
      { gx: 6, gy: 1, w: 1, h: 2, dir: 'vertical' as Direction, color: 0xcc8844 },
      { gx: 3, gy: 3, w: 1, h: 2, dir: 'vertical' as Direction, color: 0x55aa88 },
    ];

    if (!this.assisted) {
      // Hard mode — more carts
      cartConfigs.push(
        { gx: 8, gy: 2, w: 1, h: 2, dir: 'vertical' as Direction, color: 0xbb5555 },
        { gx: 0, gy: 9, w: 2, h: 1, dir: 'horizontal' as Direction, color: 0x7788cc },
      );
    }

    this.totalCarts = cartConfigs.length;

    for (let i = 0; i < cartConfigs.length; i++) {
      const cfg = cartConfigs[i];
      this.createCart(i, cfg.gx, cfg.gy, cfg.w, cfg.h, cfg.dir, cfg.color);
    }
  }

  private createCart(id: number, gx: number, gy: number, w: number, h: number, direction: Direction, color: number) {
    const cx = gx + (w - 1) / 2;
    const cy = gy + (h - 1) / 2;
    const pos = this.gridToScreen(cx, cy);

    const container = this.add.container(pos.x, pos.y);

    // Cart body
    const bodyW = w * CELL_SIZE - 12;
    const bodyH = h * CELL_SIZE - 12;

    // Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(-bodyW / 2 + 4, -bodyH / 2 + 6, bodyW, bodyH, 8);
    container.add(shadow);
    
    const bodyGraphics = this.add.graphics();
    let stripeColor = 0x000000;
    
    // Custom drawing based on color/type
    if (color === 0x8B4513) {
      // Wooden handcart
      stripeColor = 0x5c2e00; // Brown stripe
      bodyGraphics.fillStyle(0x8B4513, 1);
      bodyGraphics.lineStyle(3, stripeColor, 1);
      bodyGraphics.fillRoundedRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8);
      bodyGraphics.strokeRoundedRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8);
      container.add(bodyGraphics);
      const handle = this.add.rectangle(bodyW/2, 0, 10, 20, 0x5c2e00);
      container.add(handle);
    } else if (color === 0xcc4444 || color === 0xaa44aa) {
      // Flower stall
      stripeColor = 0xff3399; // Pink stripe
      bodyGraphics.fillStyle(0xff99cc, 1);
      bodyGraphics.lineStyle(3, stripeColor, 1);
      bodyGraphics.fillRoundedRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8);
      bodyGraphics.strokeRoundedRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8);
      container.add(bodyGraphics);
      container.add(this.add.circle(-10, -10, 8, 0xff0000));
      container.add(this.add.circle(10, 10, 8, 0xffff00));
      container.add(this.add.circle(-10, 10, 8, 0xffaa00));
    } else if (color === 0xdd8833 || color === 0xcc8844) {
      // Bullock cart
      stripeColor = 0x3d1f00; // Brown stripe
      bodyGraphics.fillStyle(0x5c2e00, 1);
      bodyGraphics.lineStyle(3, stripeColor, 1);
      bodyGraphics.fillRoundedRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8);
      bodyGraphics.strokeRoundedRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8);
      container.add(bodyGraphics);
    } else {
      // Fruit crate
      stripeColor = 0x006400; // Green stripe
      bodyGraphics.fillStyle(0x228B22, 1);
      bodyGraphics.lineStyle(3, stripeColor, 1);
      bodyGraphics.fillRoundedRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8);
      bodyGraphics.strokeRoundedRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 8);
      container.add(bodyGraphics);
      container.add(this.add.circle(0, 0, 10, 0xffaa00)); // fruit
    }

    // Wheels
    if (direction === 'horizontal') {
      container.add(this.add.circle(-bodyW / 2 + 8, bodyH / 2 + 2, 5, 0x333333));
      container.add(this.add.circle(bodyW / 2 - 8, bodyH / 2 + 2, 5, 0x333333));
    } else {
      container.add(this.add.circle(-bodyW / 2 - 2, -bodyH / 2 + 8, 5, 0x333333));
      container.add(this.add.circle(-bodyW / 2 - 2, bodyH / 2 - 8, 5, 0x333333));
    }

    // Arrow indicator showing push direction
    const arrowText = direction === 'horizontal' ? '⟵ ⟶' : '⬆\n⬇';
    const arrow = this.add.text(0, 0, arrowText, {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold', align: 'center'
    }).setOrigin(0.5).setAlpha(0.9);
    arrow.setStroke('#000000', 4);
    container.add(arrow);

    container.setDepth(pos.y + 20);

    const cart: CartData = {
      id, gx, gy, width: w, height: h, direction, sprite: container, cleared: false, color,
    };
    this.carts.push(cart);
  }

  // === DRAWING ===

  private drawGrid() {
    const g = this.add.graphics().setDepth(-10);

    // Street surface
    g.fillStyle(0x3a3a4a, 1);
    g.fillRect(OFFSET_X, OFFSET_Y, GRID_W * CELL_SIZE, GRID_H * CELL_SIZE);

    // Sidewalks
    g.fillStyle(0x555566, 1);
    g.fillRect(OFFSET_X - 60, OFFSET_Y, 60, GRID_H * CELL_SIZE);
    g.fillRect(OFFSET_X + GRID_W * CELL_SIZE, OFFSET_Y, 60, GRID_H * CELL_SIZE);
    
    // Sidewalk edge lines
    g.lineStyle(2, 0x222222, 1);
    g.lineBetween(OFFSET_X, OFFSET_Y, OFFSET_X, OFFSET_Y + GRID_H * CELL_SIZE);
    g.lineBetween(OFFSET_X + GRID_W * CELL_SIZE, OFFSET_Y, OFFSET_X + GRID_W * CELL_SIZE, OFFSET_Y + GRID_H * CELL_SIZE);

    // Subtle cobblestone pattern on road
    g.fillStyle(0x404050, 0.5);
    for (let i = 0; i < 300; i++) {
      const px = OFFSET_X + Math.random() * (GRID_W * CELL_SIZE - 20) + 10;
      const py = OFFSET_Y + Math.random() * (GRID_H * CELL_SIZE - 20) + 10;
      const pw = 8 + Math.random() * 12;
      const ph = 6 + Math.random() * 8;
      g.fillRoundedRect(px, py, pw, ph, 2);
    }

    // Grid lines (faint)
    g.lineStyle(1, 0x5a5a6a, 0.15);
    for (let x = 0; x <= GRID_W; x++) {
      g.lineBetween(OFFSET_X + x * CELL_SIZE, OFFSET_Y, OFFSET_X + x * CELL_SIZE, OFFSET_Y + GRID_H * CELL_SIZE);
    }
    for (let y = 0; y <= GRID_H; y++) {
      g.lineBetween(OFFSET_X, OFFSET_Y + y * CELL_SIZE, OFFSET_X + GRID_W * CELL_SIZE, OFFSET_Y + y * CELL_SIZE);
    }

    // Lane markings (dashed center line)
    g.lineStyle(4, 0xdddd55, 0.7);
    const centerX = OFFSET_X + (GRID_W * CELL_SIZE) / 2;
    for (let y = 0; y < GRID_H * CELL_SIZE; y += 40) {
      g.lineBetween(centerX, OFFSET_Y + y, centerX, OFFSET_Y + y + 20);
    }

    // Buildings on the sides
    if (this.textures.exists('comm_bldg_a')) {
      for (let y = 0; y < GRID_H * CELL_SIZE; y += 128) {
        this.add.image(OFFSET_X - 100, OFFSET_Y + y + 64, 'comm_bldg_a').setDepth(-5);
        this.add.image(OFFSET_X + GRID_W * CELL_SIZE + 100, OFFSET_Y + y + 64, 'comm_bldg_c').setDepth(-5).setFlipX(true);
      }
    } else {
      // Fallback building walls
      g.fillStyle(0x3a2a1a, 1);
      g.fillRect(OFFSET_X - 120, OFFSET_Y, 60, GRID_H * CELL_SIZE);
      g.fillRect(OFFSET_X + GRID_W * CELL_SIZE + 60, OFFSET_Y, 60, GRID_H * CELL_SIZE);
      
      // Windows and roofs
      for (let i = 0; i < GRID_H; i += 2) {
        g.fillStyle(0xcc6600, 1); // Orange roofs
        g.fillRect(OFFSET_X - 120, OFFSET_Y + i * CELL_SIZE, 60, 20);
        g.fillRect(OFFSET_X + GRID_W * CELL_SIZE + 60, OFFSET_Y + i * CELL_SIZE, 60, 20);
        
        // lit yellow windows
        g.fillStyle(0xffff00, 0.8);
        g.fillRect(OFFSET_X - 100, OFFSET_Y + i * CELL_SIZE + 40, 20, 30);
        g.fillRect(OFFSET_X + GRID_W * CELL_SIZE + 80, OFFSET_Y + i * CELL_SIZE + 40, 20, 30);
      }
    }

    // Diya lamps along the road that glow
    for (let i = 1; i < GRID_H; i += 2) {
      const dy = OFFSET_Y + i * CELL_SIZE;
      
      // Left side
      this.add.circle(OFFSET_X - 15, dy, 8, 0xffaa00).setDepth(-4);
      this.add.circle(OFFSET_X - 15, dy, 4, 0xffffdd).setDepth(-3);
      this.tweens.add({
        targets: this.add.circle(OFFSET_X - 15, dy, 15, 0xff8800, 0.4).setDepth(-5),
        alpha: 0.1, duration: 800 + Math.random() * 400, yoyo: true, repeat: -1
      });
      
      // Right side
      this.add.circle(OFFSET_X + GRID_W * CELL_SIZE + 15, dy, 8, 0xffaa00).setDepth(-4);
      this.add.circle(OFFSET_X + GRID_W * CELL_SIZE + 15, dy, 4, 0xffffdd).setDepth(-3);
      this.tweens.add({
        targets: this.add.circle(OFFSET_X + GRID_W * CELL_SIZE + 15, dy, 15, 0xff8800, 0.4).setDepth(-5),
        alpha: 0.1, duration: 800 + Math.random() * 400, yoyo: true, repeat: -1
      });
    }

    // Festival decorations on walls
    for (let y = 0; y < GRID_H; y += 3) {
      const wallY = OFFSET_Y + y * CELL_SIZE + CELL_SIZE / 2;
      // Left wall toran
      g.lineStyle(2, 0xff9944, 0.5);
      g.beginPath();
      g.arc(OFFSET_X - 25, wallY, 15, Math.PI * 0.2, Math.PI * 0.8, false);
      g.strokePath();
      // Right wall toran
      g.beginPath();
      g.arc(OFFSET_X + GRID_W * CELL_SIZE + 25, wallY, 15, Math.PI * 0.2, Math.PI * 0.8, false);
      g.strokePath();
    }
  }

  private drawExits() {
    for (const exit of this.exits) {
      let x: number, y: number;
      const arrowDir = exit.side;

      if (exit.side === 'left') {
        x = OFFSET_X - 25;
        y = OFFSET_Y + exit.gy * CELL_SIZE + CELL_SIZE / 2;
      } else if (exit.side === 'right') {
        x = OFFSET_X + GRID_W * CELL_SIZE + 25;
        y = OFFSET_Y + exit.gy * CELL_SIZE + CELL_SIZE / 2;
      } else if (exit.side === 'top') {
        x = OFFSET_X + exit.gx * CELL_SIZE + CELL_SIZE / 2;
        y = OFFSET_Y - 20;
      } else {
        x = OFFSET_X + exit.gx * CELL_SIZE + CELL_SIZE / 2;
        y = OFFSET_Y + GRID_H * CELL_SIZE + 20;
      }

      // Exit opening (gap in wall)
      const isVertical = exit.side === 'top' || exit.side === 'bottom';
      const gapW = isVertical ? CELL_SIZE * 1.5 : 60;
      const gapH = isVertical ? 60 : CELL_SIZE * 1.5;
      
      const exitGap = this.add.rectangle(x, y, gapW, gapH, 0x1a4a1a, 0.9)
        .setStrokeStyle(4, 0x55ff55, 1)
        .setDepth(5);
        
      // Glow effect
      this.tweens.add({
        targets: exitGap,
        alpha: 0.6,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      // Pulsing arrow
      const arrow = this.add.text(x, y, arrowDir === 'left' ? '◄' : arrowDir === 'right' ? '►' : arrowDir === 'top' ? '▲' : '▼', {
        fontSize: '28px', color: '#55ff55', fontFamily: 'Arial', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(6);

      this.tweens.add({
        targets: arrow,
        scale: 1.2,
        alpha: 0.4,
        duration: 600,
        yoyo: true,
        repeat: -1,
      });

      // "EXIT" label
      const exitText = this.add.text(x, y + (arrowDir === 'top' ? -22 : 22), 'EXIT', {
        fontSize: '14px', color: '#55ff55', fontFamily: 'Arial', fontStyle: 'bold', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(6);
      
      this.tweens.add({
        targets: exitText,
        alpha: 0.6,
        duration: 600,
        yoyo: true,
        repeat: -1,
        delay: 300,
      });
    }
  }

  private createRath() {
    const pos = this.gridToScreen(GRID_W / 2, this.rathGY);
    this.rath = this.add.container(pos.x, pos.y);

    // Rath body (simplified chariot)
    const rathBody = this.add.rectangle(0, -15, GRID_W * CELL_SIZE - 40, 50, 0xcc8833)
      .setStrokeStyle(3, 0xffd700);
    this.rath.add(rathBody);

    // Wheels
    for (let i = -3; i <= 3; i += 2) {
      const wheel = this.add.circle(i * 40, 15, 12, 0x654321)
        .setStrokeStyle(2, 0x8B4513);
      this.rath.add(wheel);
    }

    // Ganesha silhouette on top
    const ganeshText = this.add.text(0, -35, '🙏', {
      fontSize: '24px',
    }).setOrigin(0.5);
    this.rath.add(ganeshText);

    // Warning zone (amber glow ahead of rath)
    const warning = this.add.rectangle(0, -80, GRID_W * CELL_SIZE, 40, 0xff8800, 0.15)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.rath.add(warning);
    this.tweens.add({
      targets: warning,
      alpha: 0.05,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });

    this.rath.setDepth(pos.y + 100);
  }

  private createDPad() {
    const { width, height } = this.cameras.main;
    const cx = width - 80;
    const cy = height - 100;
    const btnSize = 36;

    const dirs = [
      { dx: 0, dy: -1, label: '▲', ox: 0, oy: -btnSize },
      { dx: 0, dy: 1, label: '▼', ox: 0, oy: btnSize },
      { dx: -1, dy: 0, label: '◄', ox: -btnSize, oy: 0 },
      { dx: 1, dy: 0, label: '►', ox: btnSize, oy: 0 },
    ];

    for (const d of dirs) {
      const btn = this.add.text(cx + d.ox, cy + d.oy, d.label, {
        fontSize: '24px', color: '#ffffff', fontFamily: 'Arial',
        backgroundColor: '#333333', padding: { x: 8, y: 4 },
      }).setOrigin(0.5).setDepth(10001).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        if (!this.gameOver) this.tryMove(d.dx, d.dy);
      });
    }
  }

  private endGame(won: boolean) {
    if (this.gameOver) return;
    this.gameOver = true;

    if (won) {
      this.audio.playStageClear();
      this.vfx.burstFireworks(this.cameras.main.width / 2, this.cameras.main.height / 3);
      this.cameras.main.flash(200, 255, 215, 0);
      this.statusText.setText('🔔 THE ROAD IS CLEAR!').setColor('#ffd700');

      const medal = this.assisted ? 'ASSISTED'
        : this.moves <= this.totalCarts * 3 ? 'GOLD'
        : this.moves <= this.totalCarts * 5 ? 'SILVER'
        : 'BRONZE';

      this.time.delayedCall(1500, () => {
        EventBus.emit('ui-sfx', 'perfect');
        if (this.onWinCallback) this.onWinCallback(medal);
      });
    } else {
      this.audio.playHurt();
      this.cameras.main.shake(400, 0.01);
      this.statusText.setText(`RATH ARRIVED! Cleared ${this.clearedCount}/${this.totalCarts} carts`).setColor('#ff4444');
      this.rathWarning.setText('RUKHO! RUKHO!');

      // Highlight remaining carts
      this.carts.forEach(c => {
        if (!c.cleared) {
          this.tweens.add({
            targets: c.sprite,
            alpha: { from: 1, to: 0.2 },
            duration: 300,
            yoyo: true,
            repeat: -1
          });
        }
      });

      this.time.delayedCall(3000, () => {
        if (this.onFailCallback) this.onFailCallback();
      });
    }
  }
}
