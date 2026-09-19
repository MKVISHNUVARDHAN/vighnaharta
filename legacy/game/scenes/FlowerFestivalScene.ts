import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { VFXSystem } from '../systems/VFXSystem';
import { AudioSystem } from '../systems/AudioSystem';

/**
 * FLOWER FESTIVAL — "Sandtrix" Falling Petal Mosaic
 *
 * Flower petals fall as granular particles into a circular garland mould.
 * Connect a continuous band of one color from inner to outer ring 
 * to bind a garland link. Complete 3 links to win!
 *
 * Simplified for browser: Uses a grid-based cellular automata 
 * instead of full physics sand simulation.
 *
 * Inspired by: Sandtrix, The Powder Toy
 */

const GRID_W = 20;
const GRID_H = 24;
const CELL_PX = 16;
const OFFSET_X = 200;
const OFFSET_Y = 60;

// Flower colors
const FLOWER_TYPES = [
  { name: 'Marigold', color: 0xff9933, hue: '#ff9933' },
  { name: 'Rose', color: 0xff4466, hue: '#ff4466' },
  { name: 'Lotus', color: 0xff88cc, hue: '#ff88cc' },
  { name: 'Jasmine', color: 0xffffff, hue: '#ffffff' },
  { name: 'Hibiscus', color: 0xcc2244, hue: '#cc2244' },
];

type Cell = -1 | 0 | 1 | 2 | 3 | 4; // -1=empty, 0-4=flower types

export class FlowerFestivalScene extends Phaser.Scene {
  private npcText!: Phaser.GameObjects.Text;
  // Sand grid
  private grid: Cell[][] = [];
  private pixelTexture?: Phaser.GameObjects.RenderTexture;

  // Nozzle
  private nozzleX = GRID_W / 2;
  private nozzleType: number = 0;
  private dropping = false;

  // Game state
  private linksCompleted = 0;
  private targetLinks = 3;
  private gameOver = false;
  private elapsed = 0;
  private assisted = false;
  private overflowWarning = 0;

  // Systems
  private vfx!: VFXSystem;
  private audio!: AudioSystem;

  // UI
  private statusText!: Phaser.GameObjects.Text;
  private linksText!: Phaser.GameObjects.Text;
  private nozzleIndicator!: Phaser.GameObjects.Container;
  private nextColorText!: Phaser.GameObjects.Text;

  // Callbacks
  private onWinCallback?: (medal: string) => void;
  private onFailCallback?: () => void;

  constructor() {
    super({ key: 'FlowerFestivalScene' });
  }

  init(data: { onWin?: (medal: string) => void; onFail?: () => void; assisted?: boolean }) {
    this.onWinCallback = data.onWin;
    this.onFailCallback = data.onFail;
    this.assisted = data.assisted || false;
    this.linksCompleted = 0;
    this.gameOver = false;
    this.elapsed = 0;
    this.overflowWarning = 0;
    this.nozzleType = 0;
    this.dropping = false;
    this.grid = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(-1) as Cell[]);
  }

  create() {
    const { width, height } = this.cameras.main;

    // === BACKGROUND ===
    this.add.rectangle(0, 0, width, height, 0x1a1020).setOrigin(0);

    // Garland workshop ambience
    const workshop = this.add.graphics();
    workshop.fillStyle(0x4a2a10, 1); // Wooden table
    workshop.fillRect(0, 0, width, height);
    
    // Tools on sides
    workshop.lineStyle(4, 0xcccccc);
    workshop.strokeCircle(100, height - 100, 20); // Scissors hole
    workshop.strokeCircle(140, height - 100, 20);
    workshop.lineBetween(115, height - 115, 150, height - 180);
    workshop.lineBetween(125, height - 115, 90, height - 180);
    
    // Thread spool
    workshop.fillStyle(0xffffff, 1);
    workshop.fillRect(width - 150, height - 120, 40, 60);
    workshop.fillStyle(0x8B4513, 1);
    workshop.fillRect(width - 160, height - 130, 60, 10);
    workshop.fillRect(width - 160, height - 60, 60, 10);
    
    // Window with soft light
    workshop.fillStyle(0xffffee, 0.1);
    workshop.beginPath();
    workshop.moveTo(0, 0);
    workshop.lineTo(300, 0);
    workshop.lineTo(150, height);
    workshop.lineTo(0, height);
    workshop.fillPath();

    const workshopGraphics = this.add.graphics();
    workshopGraphics.fillStyle(0x2a1a10, 0.8);
    workshopGraphics.fillRect(OFFSET_X - 20, OFFSET_Y - 20, GRID_W * CELL_PX + 40, GRID_H * CELL_PX + 40);
    workshopGraphics.lineStyle(2, 0x6a4a2a, 0.5);
    workshopGraphics.strokeRect(OFFSET_X - 20, OFFSET_Y - 20, GRID_W * CELL_PX + 40, GRID_H * CELL_PX + 40);

    // === SYSTEMS ===
    this.vfx = new VFXSystem(this);
    this.vfx.init();
    this.audio = new AudioSystem(this);
    this.audio.init();

    // === RENDER TEXTURE for sand grid ===
    this.pixelTexture = this.add.renderTexture(
      OFFSET_X, OFFSET_Y, GRID_W * CELL_PX, GRID_H * CELL_PX
    ).setOrigin(0).setDepth(10);

    // === GARLAND MOULD (target zones on left and right sides) ===
    const mouldBase = this.add.graphics().setDepth(4);
    mouldBase.lineStyle(10, 0x8B4513, 1);
    mouldBase.strokeCircle(OFFSET_X + GRID_W * CELL_PX / 2, OFFSET_Y + GRID_H * CELL_PX / 2, GRID_W * CELL_PX * 0.8);
    mouldBase.lineStyle(2, 0xffd700, 1); // golden cord
    mouldBase.strokeCircle(OFFSET_X + GRID_W * CELL_PX / 2, OFFSET_Y + GRID_H * CELL_PX / 2, GRID_W * CELL_PX * 0.8);

    const mouldG = this.add.graphics().setDepth(5);
    // Left inner ring
    mouldG.lineStyle(3, 0xffd700, 0.5);
    mouldG.lineBetween(OFFSET_X, OFFSET_Y, OFFSET_X, OFFSET_Y + GRID_H * CELL_PX);
    // Right outer ring
    mouldG.lineBetween(OFFSET_X + GRID_W * CELL_PX, OFFSET_Y, OFFSET_X + GRID_W * CELL_PX, OFFSET_Y + GRID_H * CELL_PX);
    
    // Bind zone markers (horizontal bands)
    for (let band = 0; band < 3; band++) {
      const by = OFFSET_Y + 2 + band * 8 * CELL_PX;
      mouldG.lineStyle(1, 0xffd700, 0.2);
      mouldG.lineBetween(OFFSET_X, by, OFFSET_X + GRID_W * CELL_PX, by);
      this.add.text(OFFSET_X + GRID_W * CELL_PX + 5, by, `BAND ${band + 1}`, {
        fontSize: '8px', color: '#ffd700', fontFamily: 'Arial',
      }).setDepth(20).setAlpha(0.5);
    }

    // === OVERFLOW LINE ===
    this.add.line(0, 0, OFFSET_X, OFFSET_Y + 2 * CELL_PX, OFFSET_X + GRID_W * CELL_PX, OFFSET_Y + 2 * CELL_PX, 0xff4444, 0.3)
      .setOrigin(0).setDepth(20);
    this.add.text(OFFSET_X + GRID_W * CELL_PX + 5, OFFSET_Y + 2 * CELL_PX - 6, 'OVERFLOW!', {
      fontSize: '8px', color: '#ff4444', fontFamily: 'Arial',
    }).setDepth(20).setAlpha(0.5);

    // === NOZZLE ===
    this.nozzleIndicator = this.add.container(OFFSET_X + this.nozzleX * CELL_PX, OFFSET_Y - 20).setDepth(100);
    const nozzleHead = this.add.triangle(0, 0, -8, -10, 8, -10, 0, 5, FLOWER_TYPES[0].color);
    this.nozzleIndicator.add(nozzleHead);

    // === HUD ===
    this.statusText = this.add.text(width / 2, 20, 'POUR PETALS! CONNECT LEFT TO RIGHT!', {
      fontSize: '14px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);

    this.linksText = this.add.text(20, height - 30, `GARLANDS: 0/${this.targetLinks}`, {
      fontSize: '16px', color: '#ffd700', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setDepth(200);

    this.nextColorText = this.add.text(width - 20, 20, '', {
      fontSize: '12px', color: '#ffffff', fontFamily: 'Arial',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(200);

    // Color palette selector
    FLOWER_TYPES.forEach((f, i) => {
      const btn = this.add.circle(width - 30, 60 + i * 30, 10, f.color)
        .setStrokeStyle(2, 0xffffff, i === 0 ? 1 : 0.3)
        .setInteractive({ useHandCursor: true })
        .setDepth(200);
      btn.on('pointerdown', () => {
        this.nozzleType = i;
        this.updateNozzleColor();
      });
      this.add.text(width - 45, 54 + i * 30, `${i + 1}`, {
        fontSize: '10px', color: '#aaa', fontFamily: 'Arial',
      }).setDepth(200);
    });

    // === INPUT ===
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      const gridX = Math.floor((p.x - OFFSET_X) / CELL_PX);
      if (gridX >= 0 && gridX < GRID_W) {
        this.nozzleX = gridX;
      }
    });
    this.input.on('pointerdown', () => { this.dropping = true; });
    this.input.on('pointerup', () => { this.dropping = false; });
    this.input.on('pointerout', () => { this.dropping = false; }); // Prevent infinite pour on mouse leave

    // Keyboard nozzle control
    this.input.keyboard!.on('keydown-LEFT', () => { this.nozzleX = Math.max(0, this.nozzleX - 1); });
    this.input.keyboard!.on('keydown-RIGHT', () => { this.nozzleX = Math.min(GRID_W - 1, this.nozzleX + 1); });
    this.input.keyboard!.on('keydown-A', () => { this.nozzleX = Math.max(0, this.nozzleX - 1); });
    this.input.keyboard!.on('keydown-D', () => { this.nozzleX = Math.min(GRID_W - 1, this.nozzleX + 1); });
    this.input.keyboard!.on('keydown-SPACE', () => { this.dropping = !this.dropping; });

    // Number keys to select color
    for (let i = 1; i <= 5; i++) {
      this.input.keyboard!.on(`keydown-${i}`, () => {
        this.nozzleType = i - 1;
        this.updateNozzleColor();
      });
    }

    // Florist NPC
    const npcBox = this.add.graphics().setDepth(200);
    npcBox.fillStyle(0xffffff, 1);
    npcBox.fillRoundedRect(20, 80, 150, 60, 10);
    npcBox.fillTriangle(100, 140, 120, 140, 150, 160);
    
    this.npcText = this.add.text(95, 110, 'Beautiful weaving!', {
       fontSize: '12px', color: '#000000', fontFamily: 'Arial', wordWrap: { width: 130 }
    }).setOrigin(0.5).setDepth(201);
    
    // Add Sakhi portrait
    this.add.circle(150, 180, 30, 0xff99cc).setDepth(200);
    
    // Update text periodically
    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => {
         const quotes = ['More marigold!', 'Beautiful weaving!', 'Watch the overflow!', 'Keep going!'];
         if (this.npcText) this.npcText.setText(quotes[Math.floor(Math.random() * quotes.length)]);
      }
    });

    // Camera
    this.cameras.main.fadeIn(400);

    this.events.once('shutdown', () => {
      this.vfx.destroy();
      this.audio.destroy();
    });
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return;
    this.elapsed += delta / 1000;

    // === DROP PETALS ===
    if (this.dropping && Math.random() > 0.3) {
      this.dropPetal(this.nozzleX, this.nozzleType as Cell);
      // Also drop nearby for width
      if (Math.random() > 0.5 && this.nozzleX > 0) {
        this.dropPetal(this.nozzleX - 1, this.nozzleType as Cell);
      }
      if (Math.random() > 0.5 && this.nozzleX < GRID_W - 1) {
        this.dropPetal(this.nozzleX + 1, this.nozzleType as Cell);
      }
      // Pour VFX — tiny dust puffs at nozzle
      if (Math.random() > 0.7) {
        this.vfx.dustPuff(
          OFFSET_X + this.nozzleX * CELL_PX + CELL_PX / 2,
          OFFSET_Y + 5
        );
      }
      // Pour SFX — soft granular sound
      if (Math.random() > 0.85) {
        this.audio.playFootstep();
      }
    }

    // === SIMULATE FALLING SAND (every other frame for performance) ===
    let simFrames = Math.floor(this.elapsed * 60);
    let escalateThreshold = Math.max(1, 2 - Math.floor(this.elapsed / 20)); // Starts at 2, goes to 1 then 0 (every frame)
    if (simFrames % escalateThreshold === 0)
    if (Math.floor(this.elapsed * 60) % 2 === 0) {
      this.simulateSand();
    }

    // === CHECK FOR COMPLETE BANDS ===
    this.checkBands();

    // === CHECK OVERFLOW ===
    let overflow = false;
    for (let x = 0; x < GRID_W; x++) {
      if (this.grid[1][x] !== -1) { overflow = true; break; }
    }
    if (overflow) {
      this.overflowWarning += delta / 1000;
      this.statusText.setText('⚠ OVERFLOW WARNING!').setColor('#ff4444');
      if (this.overflowWarning >= 5) {
        this.endGame(false);
      }
    } else {
      this.overflowWarning = Math.max(0, this.overflowWarning - delta / 1000);
      if (this.overflowWarning <= 0) {
        this.statusText.setText('POUR PETALS! CONNECT LEFT TO RIGHT!').setColor('#ffffff');
      }
    }

    // === RENDER GRID ===
    this.renderGrid();

    // === UPDATE NOZZLE POSITION ===
    this.nozzleIndicator.setPosition(OFFSET_X + this.nozzleX * CELL_PX + CELL_PX / 2, OFFSET_Y - 15);

    // Auto-change color hint
    this.nextColorText.setText(`COLOR: ${FLOWER_TYPES[this.nozzleType].name} (Keys 1-5)`);
  }

  // === SAND SIMULATION ===

  private dropPetal(x: number, type: Cell) {
    if (x < 0 || x >= GRID_W) return;
    if (this.grid[0][x] !== -1) return; // Column full
    this.grid[0][x] = type;
  }

  private simulateSand() {
    // Process bottom-up so gravity works correctly
    for (let y = GRID_H - 2; y >= 0; y--) {
      for (let x = 0; x < GRID_W; x++) {
        if (this.grid[y][x] === -1) continue;

        // Try to fall straight down
        if (this.grid[y + 1][x] === -1) {
          this.grid[y + 1][x] = this.grid[y][x];
          this.grid[y][x] = -1;
          continue;
        }

        // Try diagonal left
        if (x > 0 && this.grid[y + 1][x - 1] === -1 && Math.random() > 0.3) {
          this.grid[y + 1][x - 1] = this.grid[y][x];
          this.grid[y][x] = -1;
          continue;
        }

        // Try diagonal right
        if (x < GRID_W - 1 && this.grid[y + 1][x + 1] === -1 && Math.random() > 0.3) {
          this.grid[y + 1][x + 1] = this.grid[y][x];
          this.grid[y][x] = -1;
          continue;
        }
      }
    }
  }

  private renderGrid() {
    if (!this.pixelTexture) return;
    this.pixelTexture.clear();

    const g = this.pixelTexture.scene.add.graphics();

    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const cell = this.grid[y][x];
        if (cell === -1) continue;

        const color = FLOWER_TYPES[cell]?.color || 0xffffff;
        g.fillStyle(color, 0.9);
        g.fillCircle(x * CELL_PX + CELL_PX/2, y * CELL_PX + CELL_PX/2, CELL_PX/2);
        // Slight glow effect
        g.fillStyle(0xffffff, 0.3);
        g.fillCircle(x * CELL_PX + CELL_PX/3, y * CELL_PX + CELL_PX/3, CELL_PX/4);
      }
    }

    this.pixelTexture.draw(g);
    g.destroy();
  }

  // === BAND DETECTION ===

  private checkBands() {
    // Check each horizontal band (8 rows each) for a continuous path of same color from left to right
    for (let band = 0; band < 3; band++) {
      const startY = band * 8;
      const endY = startY + 8;

      // Try each flower type
      for (let type = 0; type < FLOWER_TYPES.length; type++) {
        if (this.hasConnectedPath(type as Cell, startY, endY)) {
          this.completeBand(band, type);
          return; // Only complete one per frame
        }
      }
    }
  }

  private hasConnectedPath(type: Cell, startY: number, endY: number): boolean {
    // BFS from left edge to right edge through cells of the same type
    const visited = new Set<string>();
    const queue: { x: number; y: number }[] = [];

    // Seed from left column
    for (let y = startY; y < endY && y < GRID_H; y++) {
      if (this.grid[y][0] === type) {
        queue.push({ x: 0, y });
        visited.add(`0,${y}`);
      }
    }

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;

      // Reached right edge!
      if (x === GRID_W - 1) return true;

      // Check 4 neighbors
      const neighbors = [
        { x: x + 1, y }, { x: x - 1, y },
        { x, y: y + 1 }, { x, y: y - 1 },
      ];

      for (const n of neighbors) {
        const key = `${n.x},${n.y}`;
        if (n.x < 0 || n.x >= GRID_W || n.y < startY || n.y >= endY || n.y >= GRID_H) continue;
        if (visited.has(key)) continue;
        if (this.grid[n.y][n.x] !== type) continue;

        visited.add(key);
        queue.push(n);
      }
    }

    return false;
  }

  private completeBand(band: number, type: number) {
    this.linksCompleted++;
    this.linksText.setText(`GARLANDS: ${this.linksCompleted}/${this.targetLinks}`);

    const flower = FLOWER_TYPES[type];
    this.statusText.setText(`✦ ${flower.name.toUpperCase()} GARLAND BOUND! ✦`).setColor('#ffd700');

    // Clear the band
    const startY = band * 8;
    for (let y = startY; y < startY + 8 && y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        this.grid[y][x] = -1;
      }
    }

    // VFX
    const cx = OFFSET_X + GRID_W * CELL_PX / 2;
    const cy = OFFSET_Y + startY * CELL_PX + 4 * CELL_PX;
    this.vfx.burstPetals(cx, cy, 30);
    this.vfx.burstSparks(cx, cy, 20);
    this.vfx.shockwave(cx, cy, 120);
    this.cameras.main.shake(120, 0.004);
    this.cameras.main.flash(150, 255, 200, 100);
    EventBus.emit('ui-sfx', 'perfect');
    // Spool animation
    const spoolString = this.add.line(0, 0, cx, cy, this.cameras.main.width - 130, this.cameras.main.height - 90, flower.color, 1).setOrigin(0).setDepth(200);
    this.tweens.add({
      targets: spoolString,
      alpha: 0,
      duration: 1000,
      onComplete: () => spoolString.destroy()
    });

    // Score popup
    this.vfx.scorePopup(cx, cy - 30, `${flower.name} GARLAND!`, 20, flower.color);

    // Check win
    if (this.linksCompleted >= this.targetLinks) {
      this.time.delayedCall(800, () => this.endGame(true));
    }
  }

  private updateNozzleColor() {
    const head = this.nozzleIndicator.list[0] as Phaser.GameObjects.Triangle;
    if (head) {
      head.setFillStyle(FLOWER_TYPES[this.nozzleType].color);
    }
  }

  private endGame(won: boolean) {
    if (this.gameOver) return;
    this.gameOver = true;

    if (won) {
      this.audio.playStageClear();
      this.cameras.main.flash(200, 255, 215, 0);
      this.statusText.setText('✦ ALL GARLANDS COMPLETE! ✦').setColor('#ffd700');

      const medal = this.assisted ? 'ASSISTED'
        : this.elapsed < 45 ? 'GOLD'
        : this.elapsed < 75 ? 'SILVER'
        : 'BRONZE';

      this.time.delayedCall(1500, () => {
        if (this.onWinCallback) this.onWinCallback(medal);
      });
    } else {
      this.audio.playHurt();
      this.cameras.main.shake(300, 0.008);
      this.statusText.setText('THE GARLAND CORD SNAPPED!').setColor('#ff4444');

      this.time.delayedCall(1500, () => {
        if (this.onFailCallback) this.onFailCallback();
      });
    }
  }
}
