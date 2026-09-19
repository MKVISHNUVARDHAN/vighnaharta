import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { VFXSystem } from '../systems/VFXSystem';
import { AudioSystem } from '../systems/AudioSystem';

/**
 * Game 5: MONSOON CROSSING
 */

interface Platform {
  sprite: Phaser.GameObjects.Rectangle;
  type: 'crate' | 'barrel' | 'rickshaw' | 'latch';
  sinkTimer: number;
  maxSinkTime: number;
  active: boolean;
  vx: number;
  vy: number;
}

export class MonsoonCrossingScene extends Phaser.Scene {
  private vfx!: VFXSystem;
  private audio!: AudioSystem;

  private mooshak!: Phaser.GameObjects.Sprite;
  private mooshakShadow!: Phaser.GameObjects.Ellipse;
  private umbrellaGraphics!: Phaser.GameObjects.Graphics;
  
  private platforms: Platform[] = [];
  private currentPlatform: Platform | null = null;
  private latches: Platform[] = [];
  
  private isJumping = false;
  private jumpVelocity = { x: 0, y: 0 };
  private umbrellaActive = false;
  
  private falls = 0;
  private maxFalls = 3;
  private checkpoints = [150];
  private currentCheckpoint = 0;
  
  private gameOver = false;
  
  private onWinCallback?: (medal: string) => void;
  private onFailCallback?: () => void;
  
  private statusText!: Phaser.GameObjects.Text;
  private umbrellaText!: Phaser.GameObjects.Text;
  
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
  };

  private spawnTimer = 0;
  private lightningTimer = 0;
  private windGustTimer = 0;
  private windActive = false;
  private rainParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private bgGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'MonsoonCrossingScene' });
  }

  init(data: { onWin?: (medal: string) => void; onFail?: () => void }) {
    this.onWinCallback = data.onWin;
    this.onFailCallback = data.onFail;
    this.falls = 0;
    this.currentCheckpoint = 0;
    this.gameOver = false;
    this.platforms = [];
    this.latches = [];
    this.isJumping = false;
    this.currentPlatform = null;
    this.spawnTimer = 0;
    this.lightningTimer = 8;
    this.windGustTimer = 5;
    this.windActive = false;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background: Rushing water
    this.add.rectangle(0, 0, width, height, 0x1c4a63).setOrigin(0);
    
    // Water shimmer and submerged buildings
    this.bgGraphics = this.add.graphics();
    this.drawSubmergedCity(width, height);

    // Systems
    this.vfx = new VFXSystem(this);
    this.vfx.init();
    this.audio = new AudioSystem(this);
    this.audio.init();

    this.checkpoints = [
      width * 0.1,
      width * 0.35,
      width * 0.65,
      width * 0.9,
    ];

    // Create Latches (Checkpoints/Goals) - hidden initially or just showing as brass circles in HUD
    for (let i = 0; i < this.checkpoints.length; i++) {
      const cx = this.checkpoints[i];
      const py = height / 2;
      
      const p: Platform = {
        sprite: this.add.rectangle(cx, py, 120, height, 0x5a4a3a, 0.7).setStrokeStyle(4, 0xffd700).setAlpha(0),
        type: 'latch',
        sinkTimer: 0,
        maxSinkTime: 99999,
        active: true,
        vx: 0,
        vy: 0
      };
      
      this.platforms.push(p);
      this.latches.push(p);
    }

    // Whirlpool vortex at bottom
    this.add.ellipse(width / 2, height - 50, width, 100, 0x000000, 0.4).setBlendMode(Phaser.BlendModes.MULTIPLY);

    // Mooshak
    this.mooshakShadow = this.add.ellipse(0, 0, 30, 15, 0x000000, 0.5).setDepth(99);
    this.mooshak = this.add.sprite(0, 0, 'mooshak-run-v1', 0).setScale(0.12).setOrigin(0.5, 0.8).setDepth(100);
    
    // Umbrella Graphics
    this.umbrellaGraphics = this.add.graphics().setDepth(101).setVisible(false);
    this.drawUmbrella();

    if (!this.anims.exists('mooshak-run')) {
      this.anims.create({
        key: 'mooshak-run',
        frames: this.anims.generateFrameNumbers('mooshak-run-v1', { start: 0, end: 7 }),
        frameRate: 14,
        repeat: -1,
      });
    }

    this.respawnAtCheckpoint();

    if (this.input.keyboard) {
        this.keys = this.input.keyboard.addKeys('up,down,left,right,space') as any;
    }

    // HUD
    this.statusText = this.add.text(20, 20, 'CROSS THE FLOOD! FALLS: 0/3', {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setDepth(1000);
    
    this.umbrellaText = this.add.text(20, 50, 'Hold SPACE to glide', {
      fontSize: '16px', color: '#aaaaff', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setDepth(1000);

    this.drawProgressUI(width);

    // Rain Particle Emitter
    const rainTexture = this.add.graphics().fillStyle(0xaaaaff, 0.6).fillRect(0, 0, 2, 20).generateTexture('rain_drop', 2, 20);
    rainTexture.destroy(); // destroy graphics

    this.rainParticles = this.add.particles(0, -50, 'rain_drop', {
      x: { min: -200, max: width + 200 },
      y: -50,
      lifespan: 1000,
      speedY: { min: 400, max: 600 },
      speedX: -50,
      scaleY: { min: 0.5, max: 1.5 },
      quantity: 10,
      frequency: 20
    }).setDepth(200);

    this.events.once('shutdown', () => {
      this.vfx.destroy();
      this.audio.destroy();
    });
  }

  private drawSubmergedCity(w: number, h: number) {
    this.bgGraphics.fillStyle(0x112233, 0.4);
    
    // Submerged buildings shapes
    this.bgGraphics.fillRect(w*0.1, h*0.2, 100, h);
    this.bgGraphics.fillRect(w*0.4, h*0.1, 150, h);
    this.bgGraphics.fillRect(w*0.8, h*0.3, 120, h);
    
    // Street lamps poking out
    this.bgGraphics.lineStyle(4, 0x444444);
    this.bgGraphics.beginPath();
    this.bgGraphics.moveTo(w*0.25, h*0.5);
    this.bgGraphics.lineTo(w*0.25, h*0.2);
    this.bgGraphics.lineTo(w*0.28, h*0.2);
    this.bgGraphics.strokePath();
    this.bgGraphics.fillStyle(0xffff00, 0.8);
    this.bgGraphics.fillCircle(w*0.28, h*0.22, 8);
    
    this.bgGraphics.lineStyle(4, 0x444444);
    this.bgGraphics.beginPath();
    this.bgGraphics.moveTo(w*0.75, h*0.7);
    this.bgGraphics.lineTo(w*0.75, h*0.4);
    this.bgGraphics.lineTo(w*0.72, h*0.4);
    this.bgGraphics.strokePath();
    this.bgGraphics.fillStyle(0xffff00, 0.8);
    this.bgGraphics.fillCircle(w*0.72, h*0.42, 8);

    // Water shimmer
    for(let i=0; i<30; i++) {
        this.bgGraphics.fillStyle(0xffffff, 0.1);
        this.bgGraphics.fillEllipse(Math.random()*w, Math.random()*h, 40 + Math.random()*40, 10);
    }
  }

  private drawProgressUI(w: number) {
    const startX = w / 2 - 100;
    for(let i=1; i<this.checkpoints.length; i++) {
        const cx = startX + i * 50;
        this.add.circle(cx, 40, 15, 0x5a4a3a).setStrokeStyle(2, 0x333333).setDepth(1000);
        // We will light them up in update or checkpoint
        const fill = this.add.circle(cx, 40, 10, 0xffd700).setDepth(1000).setAlpha(0);
        (this.latches[i] as any).uiFill = fill;
    }
  }

  private drawUmbrella() {
    this.umbrellaGraphics.clear();
    this.umbrellaGraphics.fillStyle(0xff3333, 1);
    this.umbrellaGraphics.beginPath();
    this.umbrellaGraphics.arc(0, 0, 40, Math.PI, 0, false);
    this.umbrellaGraphics.fillPath();
    
    this.umbrellaGraphics.fillStyle(0xffff33, 1);
    this.umbrellaGraphics.beginPath();
    this.umbrellaGraphics.arc(0, 0, 40, Math.PI, Math.PI*1.5, false);
    this.umbrellaGraphics.fillPath();

    this.umbrellaGraphics.lineStyle(4, 0x8b4513);
    this.umbrellaGraphics.beginPath();
    this.umbrellaGraphics.moveTo(0, 0);
    this.umbrellaGraphics.lineTo(0, 40);
    this.umbrellaGraphics.strokePath();
    
    // Handle curve
    this.umbrellaGraphics.beginPath();
    this.umbrellaGraphics.arc(5, 40, 5, Math.PI, 0, true);
    this.umbrellaGraphics.strokePath();
  }

  update(time: number, delta: number) {
    if (this.gameOver) return;
    
    const dt = delta / 1000;

    // Lightning
    this.lightningTimer -= dt;
    if (this.lightningTimer <= 0) {
        this.cameras.main.flash(100, 255, 255, 255);
        this.lightningTimer = Phaser.Math.Between(8, 12);
        // Thunder sound could be added
    }

    // Wind Gusts
    this.windGustTimer -= dt;
    if (this.windGustTimer <= 0) {
        this.windActive = !this.windActive;
        this.windGustTimer = this.windActive ? 3 : Phaser.Math.Between(4, 7);
        
        if (this.windActive) {
            this.rainParticles.speedX = 300; // wind blowing right
        } else {
            this.rainParticles.speedX = -50; // normal
        }
    }

    // Umbrella
    this.umbrellaActive = this.keys.space.isDown;
    if (this.umbrellaActive) {
        this.umbrellaGraphics.setVisible(true);
        this.umbrellaGraphics.setPosition(this.mooshak.x, this.mooshak.y - 40);
    } else {
        this.umbrellaGraphics.setVisible(false);
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnPlatform();
      this.spawnTimer = 0.5 + Math.random() * 1.0;
    }

    this.updatePlatforms(dt);
    this.updateMooshak(dt);
  }

  private spawnPlatform() {
    const { width, height } = this.cameras.main;
    
    const startX = width * 0.15;
    const endX = width * 0.85;
    const px = startX + Math.random() * (endX - startX);
    
    if (Math.abs(px - this.checkpoints[1]) < 80 || Math.abs(px - this.checkpoints[2]) < 80) return;

    const py = -50;
    
    const rand = Math.random();
    let type: 'crate' | 'barrel' | 'rickshaw' = 'crate';
    let maxSinkTime = 1.5;
    let w = 60, h = 60, color = 0x8b5a2b;
    let vy = 80 + Math.random() * 60;

    if (rand > 0.8) {
      type = 'rickshaw';
      maxSinkTime = 999;
      w = 100; h = 80; color = 0x333333;
      vy = 50 + Math.random() * 30;
    } else if (rand > 0.4) {
      type = 'barrel';
      maxSinkTime = 3.0;
      w = 70; h = 70; color = 0xa0522d;
      vy = 70 + Math.random() * 40;
    }

    const sprite = this.add.rectangle(px, py, w, h, color)
      .setStrokeStyle(2, 0x000000)
      .setDepth(10);

    // Decorate debris
    if (type === 'rickshaw') {
        const g = this.add.graphics();
        g.fillStyle(0xffff00, 1);
        g.fillRect(px - w/2, py - h/2, w, h*0.2); // yellow top
        sprite.setData('decor', g);
    }

    this.platforms.push({
      sprite, type, maxSinkTime, sinkTimer: 0, active: true, vx: 0, vy
    });
  }

  private updatePlatforms(dt: number) {
    const { height } = this.cameras.main;

    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const p = this.platforms[i];
      if (!p.active) continue;

      // Apply wind if not latch
      if (p.type !== 'latch' && this.windActive) {
          p.vx = 80; // push right
      } else if (p.type !== 'latch') {
          p.vx = 0;
      }

      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      
      const decor = p.sprite.getData('decor');
      if (decor) {
          decor.setPosition(p.sprite.x - p.sprite.width/2, p.sprite.y - p.sprite.height/2);
      }

      if (this.currentPlatform === p && p.type !== 'latch' && p.type !== 'rickshaw') {
        p.sinkTimer += dt;
        
        const ratio = p.sinkTimer / p.maxSinkTime;
        if (ratio > 0.8) {
            p.sprite.setFillStyle(0xff0000);
        } else if (ratio > 0.5) {
            p.sprite.setFillStyle(0xffaa00);
        }
        
        if (p.sinkTimer >= p.maxSinkTime) {
          this.sinkPlatform(p);
        }
      }

      if (p.sprite.y > height + 100) {
        this.destroyPlatform(p, i);
      }
    }
  }

  private sinkPlatform(p: Platform) {
    p.active = false;
    this.tweens.add({
      targets: p.sprite,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0,
      duration: 300,
      onComplete: () => {
         p.sprite.setVisible(false);
         const decor = p.sprite.getData('decor');
         if (decor) decor.destroy();
      }
    });
    
    if (this.currentPlatform === p) {
      this.currentPlatform = null;
      this.fallIntoWater();
    }
  }

  private destroyPlatform(p: Platform, index: number) {
    p.active = false;
    const decor = p.sprite.getData('decor');
    if (decor) decor.destroy();
    p.sprite.destroy();
    this.platforms.splice(index, 1);
  }

  private updateMooshak(dt: number) {
    if (this.isJumping) {
      const speed = this.umbrellaActive ? 150 : 300;
      let targetVx = this.jumpVelocity.x * speed;
      
      // Wind affects mid-air jumping Mooshak, especially if umbrella is active
      if (this.windActive && this.umbrellaActive) {
          targetVx += 150; 
      }
      
      this.mooshak.x += targetVx * dt;
      this.mooshak.y += this.jumpVelocity.y * speed * dt;
      this.mooshakShadow.setPosition(this.mooshak.x, this.mooshak.y);
      
      if (!this.checkLanding()) {
         if (this.mooshak.x < -50 || this.mooshak.x > this.cameras.main.width + 50 || 
             this.mooshak.y < -50 || this.mooshak.y > this.cameras.main.height + 50) {
             this.fallIntoWater();
         }
      }
    } else {
      if (this.currentPlatform && this.currentPlatform.active) {
        this.mooshak.x += this.currentPlatform.vx * dt;
        this.mooshak.y += this.currentPlatform.vy * dt;
        this.mooshakShadow.setPosition(this.mooshak.x, this.mooshak.y);
        
        if (this.mooshak.y > this.cameras.main.height - 30) {
            this.fallIntoWater();
            return;
        }

        let dx = 0, dy = 0;
        if (Phaser.Input.Keyboard.JustDown(this.keys.left)) dx = -1;
        if (Phaser.Input.Keyboard.JustDown(this.keys.right)) dx = 1;
        if (Phaser.Input.Keyboard.JustDown(this.keys.up)) dy = -1;
        if (Phaser.Input.Keyboard.JustDown(this.keys.down)) dy = 1;

        if (dx !== 0 || dy !== 0) {
          this.jump(dx, dy);
        }
      } else {
          this.fallIntoWater();
      }
    }
  }

  private jump(dx: number, dy: number) {
    this.isJumping = true;
    this.currentPlatform = null;
    this.mooshak.play('mooshak-run', true);
    
    const len = Math.sqrt(dx*dx + dy*dy);
    this.jumpVelocity = { x: dx/len, y: dy/len };
    
    if (dx < 0) this.mooshak.setFlipX(true);
    if (dx > 0) this.mooshak.setFlipX(false);
    
    this.audio.playDashStart();
    
    this.tweens.add({
        targets: this.mooshak,
        scaleX: 0.15,
        scaleY: 0.15,
        duration: 200,
        yoyo: true
    });
    
    this.time.delayedCall(400, () => {
        if (this.isJumping) {
            this.land();
        }
    });
  }

  private createWaterRipple(x: number, y: number) {
      const g = this.add.graphics().setDepth(5);
      const ripple = { r: 5, alpha: 1 };
      
      this.tweens.add({
          targets: ripple,
          r: 50,
          alpha: 0,
          duration: 600,
          onUpdate: () => {
              g.clear();
              g.lineStyle(2, 0xffffff, ripple.alpha);
              g.strokeEllipse(x, y, ripple.r, ripple.r * 0.5);
          },
          onComplete: () => g.destroy()
      });
  }

  private land() {
    this.isJumping = false;
    this.mooshak.stop();
    this.mooshak.setScale(0.12);

    let landed = false;
    for (const p of this.platforms) {
      if (!p.active) continue;
      
      const bounds = p.sprite.getBounds();
      if (bounds.contains(this.mooshak.x, this.mooshak.y)) {
        this.currentPlatform = p;
        landed = true;
        this.audio.playImpact();
        
        if (p.type !== 'latch') {
            this.createWaterRipple(this.mooshak.x, this.mooshak.y);
        }
        
        if (p.type === 'latch') {
            const cpIndex = this.latches.indexOf(p);
            if (cpIndex > this.currentCheckpoint) {
                this.currentCheckpoint = cpIndex;
                this.vfx.burstSparks(this.mooshak.x, this.mooshak.y, 20);
                this.audio.playStageClear(); 
                
                // Light up UI
                const uiFill = (p as any).uiFill;
                if (uiFill) {
                    this.tweens.add({ targets: uiFill, alpha: 1, duration: 300 });
                }
                
                if (cpIndex === this.latches.length - 1) {
                    this.win();
                }
            }
        }
        break;
      }
    }

    if (!landed) {
      this.fallIntoWater();
    }
  }

  private checkLanding(): boolean {
     return false;
  }

  private fallIntoWater() {
    if (this.gameOver) return;
    
    this.isJumping = false;
    this.falls++;
    this.audio.playHurt();
    
    this.vfx.dustPuff(this.mooshak.x, this.mooshak.y);
    this.cameras.main.shake(200, 0.01);
    
    this.statusText.setText(`CROSS THE FLOOD! FALLS: ${this.falls}/3`);
    
    this.mooshak.setVisible(false);
    this.mooshakShadow.setVisible(false);
    this.umbrellaGraphics.setVisible(false);

    if (this.falls >= this.maxFalls) {
      this.fail();
    } else {
      this.time.delayedCall(1000, () => {
        if (!this.gameOver) this.respawnAtCheckpoint();
      });
    }
  }

  private respawnAtCheckpoint() {
    const cx = this.checkpoints[this.currentCheckpoint];
    const cy = this.cameras.main.height / 2;
    
    this.mooshak.setPosition(cx, cy);
    this.mooshakShadow.setPosition(cx, cy);
    this.mooshak.setVisible(true);
    this.mooshakShadow.setVisible(true);
    
    this.currentPlatform = this.latches[this.currentCheckpoint];
    this.isJumping = false;
  }

  private win() {
    this.gameOver = true;
    this.audio.playStageClear();
    this.vfx.burstFireworks(this.cameras.main.width / 2, this.cameras.main.height / 3);
    this.statusText.setText('SAFE CROSSING!').setColor('#ffd700');
    
    const medal = this.falls === 0 ? 'GOLD' : this.falls === 1 ? 'SILVER' : 'BRONZE';
    
    this.time.delayedCall(1500, () => {
      EventBus.emit('ui-sfx', 'perfect');
      if (this.onWinCallback) this.onWinCallback(medal);
    });
  }

  private fail() {
    this.gameOver = true;
    this.statusText.setText('WASHED AWAY!').setColor('#ff4444');
    
    this.time.delayedCall(1500, () => {
      if (this.onFailCallback) this.onFailCallback();
    });
  }
}
