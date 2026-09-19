import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { VFXSystem } from '../systems/VFXSystem';
import { AudioSystem } from '../systems/AudioSystem';

/**
 * Game 6: RANGOLI LIGHTWORKS
 */

const GRID_SIZE = 8;
const CELL_SIZE = 80;
const OFFSET_X = 640;
const OFFSET_Y = 200;

type TileType = 'empty' | 'wall' | 'mirror' | 'target' | 'flame';

interface TileData {
  gx: number;
  gy: number;
  type: TileType;
  sprite?: Phaser.GameObjects.Rectangle;
  icon?: Phaser.GameObjects.Text | Phaser.GameObjects.Arc | Phaser.GameObjects.Rectangle;
  mirrorAngle: number;
  lit: boolean;
  beamTween?: Phaser.Tweens.Tween;
}

export class RangoliLightScene extends Phaser.Scene {
  private vfx!: VFXSystem;
  private audio!: AudioSystem;

  private grid: TileData[][] = [];
  private targets: TileData[] = [];
  
  private beamGraphics!: Phaser.GameObjects.Graphics;
  
  private timeRemaining = 30;
  private timerText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  
  private gameOver = false;
  
  private onWinCallback?: (medal: string) => void;
  private onFailCallback?: () => void;

  private bgGraphics!: Phaser.GameObjects.Graphics;
  private windActive = false;
  private cloudParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private flameText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'RangoliLightScene' });
  }

  init(data: { onWin?: (medal: string) => void; onFail?: () => void }) {
    this.onWinCallback = data.onWin;
    this.onFailCallback = data.onFail;
    this.gameOver = false;
    this.timeRemaining = 30;
    this.grid = [];
    this.targets = [];
    this.windActive = false;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background - Ghat courtyard
    this.bgGraphics = this.add.graphics();
    this.drawCourtyardBackground(width, height);

    // Cloud particles for Sea Breeze
    const cloudTex = this.add.graphics().fillStyle(0xffffff, 0.2).fillCircle(10, 10, 10).generateTexture('cloud_wisp', 20, 20);
    cloudTex.destroy();

    this.cloudParticles = this.add.particles(0, 0, 'cloud_wisp', {
        x: -50,
        y: { min: 100, max: height - 100 },
        speedX: { min: 100, max: 200 },
        speedY: { min: -10, max: 10 },
        scale: { start: 1, end: 4 },
        alpha: { start: 0, end: 0 },
        lifespan: 10000,
        frequency: 300,
        emitting: false
    }).setDepth(50);

    // Systems
    this.vfx = new VFXSystem(this);
    this.vfx.init();
    this.audio = new AudioSystem(this);
    this.audio.init();

    this.setupGrid();

    // Beam Graphics
    this.beamGraphics = this.add.graphics();
    this.beamGraphics.setBlendMode(Phaser.BlendModes.ADD);
    this.beamGraphics.setDepth(10);

    // HUD
    this.statusText = this.add.text(width / 2, 50, 'ILLUMINATE ALL 6 CHAKRAS', {
      fontSize: '24px', color: '#ffcc00', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100);

    this.timerText = this.add.text(width / 2, 90, 'SEA BREEZE IN: 30s', {
      fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(100);

    // Timer Event
    this.time.addEvent({
      delay: 1000,
      callback: this.tickTimer,
      callbackScope: this,
      loop: true
    });

    this.events.once('shutdown', () => {
      this.vfx.destroy();
      this.audio.destroy();
    });
    
    this.calculateBeam();
  }

  private drawCourtyardBackground(w: number, h: number) {
      this.bgGraphics.clear();
      // Sky
      this.bgGraphics.fillStyle(0x050a15, 1);
      this.bgGraphics.fillRect(0, 0, w, h);
      
      // Stars
      this.bgGraphics.fillStyle(0xffffff, 0.8);
      for(let i=0; i<100; i++) {
          this.bgGraphics.fillRect(Math.random()*w, Math.random()*h*0.4, 2, 2);
      }
      
      // Stone Floor
      this.bgGraphics.fillStyle(0x1a1a24, 1);
      const gridW = GRID_SIZE * CELL_SIZE + 40;
      const gridH = GRID_SIZE * CELL_SIZE + 40;
      this.bgGraphics.fillRect(OFFSET_X - 20, OFFSET_Y - 20, gridW, gridH);
      
      // Grid lines
      this.bgGraphics.lineStyle(1, 0x333344, 0.5);
      for(let i=0; i<=GRID_SIZE; i++) {
          this.bgGraphics.moveTo(OFFSET_X + i*CELL_SIZE, OFFSET_Y);
          this.bgGraphics.lineTo(OFFSET_X + i*CELL_SIZE, OFFSET_Y + GRID_SIZE*CELL_SIZE);
          this.bgGraphics.moveTo(OFFSET_X, OFFSET_Y + i*CELL_SIZE);
          this.bgGraphics.lineTo(OFFSET_X + GRID_SIZE*CELL_SIZE, OFFSET_Y + i*CELL_SIZE);
      }
      this.bgGraphics.strokePath();

      // Water at edges
      this.bgGraphics.fillStyle(0x0a1525, 0.5);
      this.bgGraphics.fillRect(0, h*0.8, w, h*0.2);
  }

  update(time: number) {
    if (this.gameOver) return;
    
    // Pulsing lit targets
    this.targets.forEach(t => {
      if (t.lit && t.sprite) {
        // Divine golden glow pulse
        t.sprite.setStrokeStyle(4, 0xffd700, 0.5 + Math.sin(time / 150) * 0.5);
        if (t.icon instanceof Phaser.GameObjects.Arc) {
            t.icon.setFillStyle(0xffd700, 0.8 + Math.sin(time / 100) * 0.2);
            t.icon.setScale(1 + Math.sin(time / 100) * 0.1);
        }
      } else if (t.sprite) {
        t.sprite.setStrokeStyle(2, 0x444455, 1);
        if (t.icon instanceof Phaser.GameObjects.Arc) {
            t.icon.setFillStyle(0x222222);
            t.icon.setScale(1);
        }
      }
    });

    // Flame flicker
    if (this.flameText) {
        if (this.windActive) {
            this.flameText.setAngle(Math.sin(time / 50) * 20); // erratic flicker
            this.flameText.setAlpha(0.6 + Math.random() * 0.4);
        } else {
            this.flameText.setAngle(Math.sin(time / 150) * 5); // smooth flicker
            this.flameText.setAlpha(1);
        }
    }
  }

  private setupGrid() {
    for (let x = 0; x < GRID_SIZE; x++) {
      this.grid[x] = [];
      for (let y = 0; y < GRID_SIZE; y++) {
        this.grid[x][y] = { gx: x, gy: y, type: 'empty', mirrorAngle: 0, lit: false };
      }
    }

    this.grid[0][4].type = 'flame';
    
    const targetPos = [[2, 1], [5, 2], [7, 4], [4, 7], [6, 6], [1, 6]];
    targetPos.forEach(([tx, ty]) => {
      this.grid[tx][ty].type = 'target';
      this.targets.push(this.grid[tx][ty]);
    });

    const mirrorPos = [
       {x:2, y:4, a:45}, {x:2, y:2, a:135}, {x:5, y:2, a:45}, 
       {x:5, y:4, a:135}, {x:7, y:4, a:45}, {x:4, y:4, a:135},
       {x:4, y:7, a:45}, {x:6, y:4, a:135}, {x:6, y:6, a:45},
       {x:1, y:4, a:45}, {x:1, y:6, a:135}, {x:2, y:6, a:45}
    ];
    
    mirrorPos.forEach(m => {
       if (m.x < GRID_SIZE && m.y < GRID_SIZE) {
         this.grid[m.x][m.y].type = 'mirror';
         this.grid[m.x][m.y].mirrorAngle = m.a;
       }
    });

    this.grid[3][3].type = 'wall';
    this.grid[3][5].type = 'wall';

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const t = this.grid[x][y];
        const px = OFFSET_X + x * CELL_SIZE + CELL_SIZE / 2;
        const py = OFFSET_Y + y * CELL_SIZE + CELL_SIZE / 2;
        
        const rect = this.add.rectangle(px, py, CELL_SIZE - 4, CELL_SIZE - 4, 0x000000, 0); // transparent background
        t.sprite = rect;

        if (t.type === 'flame') {
            this.flameText = this.add.text(px, py, '🔥', { fontSize: '36px' }).setOrigin(0.5);
        } else if (t.type === 'target') {
            rect.setFillStyle(0x331133, 0.5);
            t.icon = this.add.circle(px, py, 15, 0x222222).setStrokeStyle(2, 0x888888);
            
            // Inner symbol for chakra
            this.add.text(px, py, 'ॐ', { fontSize: '16px', color: '#888' }).setOrigin(0.5).setAlpha(0.5);

        } else if (t.type === 'wall') {
            rect.setFillStyle(0x111111, 0.8);
            // Draw a subtle block
            this.add.rectangle(px, py, CELL_SIZE - 10, CELL_SIZE - 10, 0x222222).setStrokeStyle(1, 0x444444);
        } else if (t.type === 'mirror') {
            // Mirror base
            this.add.circle(px, py, 20, 0x223344).setStrokeStyle(2, 0x446688);

            const line = this.add.rectangle(px, py, CELL_SIZE * 0.7, 8, 0x00ffff);
            line.setAngle(t.mirrorAngle);
            t.icon = line;
            
            rect.setInteractive({ useHandCursor: true });
            rect.on('pointerdown', () => {
                if (this.gameOver) return;
                this.audio.playImpact(); // metal clink 
                
                t.mirrorAngle = t.mirrorAngle === 45 ? 135 : 45;
                if (t.icon && t.icon instanceof Phaser.GameObjects.Rectangle) {
                    this.tweens.add({
                        targets: t.icon,
                        angle: t.mirrorAngle,
                        duration: 150,
                        ease: 'Back.easeOut',
                        onComplete: () => this.calculateBeam()
                    });
                } else {
                    this.calculateBeam();
                }
            });
        }
      }
    }
  }

  private tickTimer() {
    if (this.gameOver) return;
    this.timeRemaining--;
    
    if (this.timeRemaining === 10) {
        this.windActive = true;
        this.timerText.setColor('#88aaff');
        this.cloudParticles.start();
        this.cameras.main.shake(100, 0.001);
    }

    if (this.timeRemaining <= 5) {
      this.timerText.setColor('#ff0000');
      this.audio.playHurt();
      this.cameras.main.shake(100, 0.002);
    }
    
    this.timerText.setText(this.windActive ? `WIND BLOWING: ${this.timeRemaining}s` : `SEA BREEZE IN: ${this.timeRemaining}s`);

    if (this.timeRemaining <= 0) {
      this.fail();
    }
  }

  private calculateBeam() {
    this.beamGraphics.clear();
    
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        this.grid[x][y].lit = false;
        if (this.grid[x][y].beamTween) {
            this.grid[x][y].beamTween?.stop();
        }
      }
    }

    let cx = 0;
    let cy = 4;
    let dx = 1;
    let dy = 0;
    
    const maxSteps = 100;
    let steps = 0;
    
    let currentX = OFFSET_X + cx * CELL_SIZE + CELL_SIZE / 2;
    let currentY = OFFSET_Y + cy * CELL_SIZE + CELL_SIZE / 2;
    
    // Core beam
    this.beamGraphics.lineStyle(8, 0xffffff, 1);
    this.beamGraphics.beginPath();
    this.beamGraphics.moveTo(currentX, currentY);
    
    // Outer glow
    const glowGraphics = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD).setDepth(9);
    glowGraphics.lineStyle(16, 0xffaa00, 0.5);
    glowGraphics.beginPath();
    glowGraphics.moveTo(currentX, currentY);

    const visited = new Set<string>();

    while (steps < maxSteps) {
       steps++;
       cx += dx;
       cy += dy;

       if (cx < 0 || cy < 0 || cx >= GRID_SIZE || cy >= GRID_SIZE) {
           currentX += dx * CELL_SIZE;
           currentY += dy * CELL_SIZE;
           this.beamGraphics.lineTo(currentX, currentY);
           glowGraphics.lineTo(currentX, currentY);
           break;
       }

       currentX = OFFSET_X + cx * CELL_SIZE + CELL_SIZE / 2;
       currentY = OFFSET_Y + cy * CELL_SIZE + CELL_SIZE / 2;
       this.beamGraphics.lineTo(currentX, currentY);
       glowGraphics.lineTo(currentX, currentY);

       // Particles along path
       if (Math.random() > 0.5) {
           this.vfx.burstSparks(currentX - dx*CELL_SIZE/2, currentY - dy*CELL_SIZE/2, 2);
       }

       const cell = this.grid[cx][cy];
       const visitKey = `${cx},${cy},${dx},${dy}`;
       
       if (visited.has(visitKey)) {
           break;
       }
       visited.add(visitKey);

       if (cell.type === 'wall') {
           break;
       }

       if (cell.type === 'target') {
           cell.lit = true;
       }

       if (cell.type === 'mirror') {
           if (cell.mirrorAngle === 45) {
               if (dx === 1) { dx = 0; dy = 1; }
               else if (dx === -1) { dx = 0; dy = -1; }
               else if (dy === 1) { dx = 1; dy = 0; }
               else if (dy === -1) { dx = -1; dy = 0; }
           } else {
               if (dx === 1) { dx = 0; dy = -1; }
               else if (dx === -1) { dx = 0; dy = 1; }
               else if (dy === 1) { dx = -1; dy = 0; }
               else if (dy === -1) { dx = 1; dy = 0; }
           }
       }
    }

    this.beamGraphics.strokePath();
    glowGraphics.strokePath();
    
    // Fade out glow graphics
    this.tweens.add({
        targets: glowGraphics,
        alpha: 0,
        duration: 300,
        onComplete: () => glowGraphics.destroy()
    });

    this.vfx.burstSparks(currentX, currentY, 5);

    this.checkWin();
  }

  private checkWin() {
    const allLit = this.targets.every(t => t.lit);
    if (allLit && !this.gameOver) {
        this.win();
    }
  }

  private win() {
    this.gameOver = true;
    this.timerText.setVisible(false);
    this.cloudParticles.stop();
    
    this.audio.playStageClear();
    
    // Courtyard illuminates gradually
    const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xffaa00, 0).setOrigin(0).setDepth(1);
    this.tweens.add({
        targets: overlay,
        fillAlpha: 0.2,
        duration: 2000
    });
    
    // Draw Devotee silhouettes at bottom
    const devG = this.add.graphics().setDepth(2);
    devG.fillStyle(0x000000, 0.8);
    for(let i=0; i<15; i++) {
        devG.fillCircle(100 + i*120, this.cameras.main.height - 30, 20); // head
        devG.fillRect(80 + i*120, this.cameras.main.height - 20, 40, 50); // body
    }
    devG.setAlpha(0);
    this.tweens.add({ targets: devG, alpha: 1, duration: 2000 });

    // Beam pillar from each target
    this.targets.forEach(t => {
        const px = OFFSET_X + t.gx * CELL_SIZE + CELL_SIZE / 2;
        const py = OFFSET_Y + t.gy * CELL_SIZE + CELL_SIZE / 2;
        
        const pillar = this.add.rectangle(px, py, 20, 0, 0xffffff, 0.8).setOrigin(0.5, 1).setDepth(20).setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
            targets: pillar,
            height: this.cameras.main.height,
            duration: 1000,
            ease: 'Power2'
        });
    });

    this.vfx.burstFireworks(this.cameras.main.width / 2, this.cameras.main.height / 3);
    this.statusText.setText('CHAKRAS ALIGNED!').setColor('#00ff00').setDepth(100);
    
    const medal = this.timeRemaining > 15 ? 'GOLD' : this.timeRemaining > 5 ? 'SILVER' : 'BRONZE';
    
    this.time.delayedCall(3000, () => {
      EventBus.emit('ui-sfx', 'perfect');
      if (this.onWinCallback) this.onWinCallback(medal);
    });
  }

  private fail() {
    this.gameOver = true;
    this.statusText.setText('THE FLAMES BLEW OUT!').setColor('#ff4444');
    this.audio.playHurt();
    
    this.cloudParticles.stop();

    this.time.delayedCall(1500, () => {
      if (this.onFailCallback) this.onFailCallback();
    });
  }
}
