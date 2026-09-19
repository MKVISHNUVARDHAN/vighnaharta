import Phaser from 'phaser';
import { EventBus } from '../EventBus';
import { VFXSystem } from '../systems/VFXSystem';
import { AudioSystem } from '../systems/AudioSystem';

/**
 * GAME 4: DHOL UTSAV — Jugalbandi Call-and-Response Rhythm Game
 */

const LANE_KEYS = ['D', 'F', 'J', 'K'];
const LANE_COLORS = [0xff6600, 0xffaa00, 0x00ffff, 0xaa00ff]; // Bass, Treble, Tasha L, Tasha R
const NOTE_SPEED = 0.6; // pixels per ms
const STRIKE_Y = 800; 
const START_DELAY_MS = 3000;

interface NoteData {
  id: number;
  time: number;
  lane: number;
  isCall: boolean;
  hit: boolean;
  missed: boolean;
  sprite?: Phaser.GameObjects.Container;
}

class DrumSynth {
  private ctx: AudioContext;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  resume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  destroy() {
    this.ctx.close();
  }

  playDholBass() {
    this.resume();
    this.playTone(80, 'sine', 0.1);
    this.playNoise(0.1, 800);
  }

  playDholTreble() {
    this.resume();
    this.playTone(200, 'triangle', 0.06);
  }

  playTasha() {
    this.resume();
    this.playTone(400, 'square', 0.04);
    this.playNoise(0.04, 3000);
  }

  private playTone(freq: number, type: OscillatorType, duration: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  private playNoise(duration: number, filterFreq: number) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    
    const gain = this.ctx.createGain();
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    noise.start(this.ctx.currentTime);
  }
}

export class DholUtsavScene extends Phaser.Scene {
  // Systems
  private vfx!: VFXSystem;
  private audio!: AudioSystem;
  private synth!: DrumSynth;

  // Game State
  private notes: NoteData[] = [];
  private elapsedMs = 0;
  private isPlaying = false;
  private gameOver = false;
  
  private josh = 50; // 0 to 100
  private kallolMode = false;
  
  // Layout
  private laneXs: number[] = [];
  private strikeY = 0;
  
  // UI
  private joshBarFill!: Phaser.GameObjects.Rectangle;
  private joshText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private combo = 0;
  private comboText!: Phaser.GameObjects.Text;
  private bpmText!: Phaser.GameObjects.Text;
  
  // Callbacks
  private onWinCallback?: (medal: string) => void;
  private onFailCallback?: () => void;

  // Atmosphere
  private crowdFigures: Phaser.GameObjects.Container[] = [];
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private shockwaveGraphics!: Phaser.GameObjects.Graphics;

  private currentBpm = 95;

  constructor() {
    super({ key: 'DholUtsavScene' });
  }

  init(data: { onWin?: (medal: string) => void; onFail?: () => void }) {
    this.onWinCallback = data.onWin;
    this.onFailCallback = data.onFail;
    this.notes = [];
    this.elapsedMs = 0;
    this.isPlaying = false;
    this.gameOver = false;
    this.josh = 50;
    this.kallolMode = false;
    this.combo = 0;
    this.crowdFigures = [];
  }

  create() {
    const { width, height } = this.cameras.main;
    this.strikeY = height - 150;

    // Background
    this.add.rectangle(0, 0, width, height, 0x110a1f).setOrigin(0);

    // Systems
    this.vfx = new VFXSystem(this);
    this.vfx.init();
    this.audio = new AudioSystem(this);
    this.audio.init();
    this.synth = new DrumSynth();

    this.generateTextures();

    // Backdrop - Isometric Street
    this.bgGraphics = this.add.graphics().setDepth(0);
    this.drawStreetBackdrop(width, height);

    // Layout
    const laneWidth = 100;
    const startX = width / 2 - (laneWidth * 2) + (laneWidth / 2);
    
    for (let i = 0; i < 4; i++) {
      const x = startX + i * laneWidth;
      this.laneXs.push(x);
      
      // Lane background
      this.add.rectangle(x, height / 2, laneWidth - 10, height, LANE_COLORS[i], 0.05).setDepth(1);
      
      // Key label
      this.add.text(x, this.strikeY + 50, LANE_KEYS[i], {
        fontSize: '32px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(10);
      
      // Strike zone indicator
      this.add.circle(x, this.strikeY, 35, LANE_COLORS[i], 0.2)
        .setStrokeStyle(4, LANE_COLORS[i], 0.8)
        .setDepth(2);
    }

    // Strike Line
    this.add.rectangle(width / 2, this.strikeY, laneWidth * 4, 4, 0xffffff, 0.8).setDepth(2);

    // Shockwave Graphics
    this.shockwaveGraphics = this.add.graphics().setDepth(3);

    // Crowd
    this.createCrowd(width, height);

    // UI
    this.createUI(width, height);

    // Generate Note Map
    this.generateBeatMap();

    // Inputs
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (!this.isPlaying || this.gameOver) return;
      const key = e.key.toUpperCase();
      const laneIdx = LANE_KEYS.indexOf(key);
      if (laneIdx !== -1) {
        this.handleHit(laneIdx);
      }
    });

    // Start Sequence
    this.cameras.main.fadeIn(500);
    this.statusText.setText('GET READY...');
    
    this.time.delayedCall(1500, () => {
      this.statusText.setText('START!');
      this.synth.resume();
      this.tweens.add({
        targets: this.statusText,
        alpha: 0,
        duration: 1000,
        onComplete: () => { this.isPlaying = true; }
      });
    });

    this.events.once('shutdown', () => {
      this.vfx.destroy();
      this.audio.destroy();
      this.synth.destroy();
    });
  }

  private drawStreetBackdrop(w: number, h: number) {
    this.bgGraphics.clear();
    // Sky
    this.bgGraphics.fillStyle(0x0a0510, 1);
    this.bgGraphics.fillRect(0, 0, w, h);
    
    // Buildings (Left and Right)
    this.bgGraphics.fillStyle(0x221133, 1);
    // Left
    this.bgGraphics.fillRect(0, h*0.2, w*0.2, h);
    this.bgGraphics.fillRect(w*0.05, h*0.1, w*0.1, h);
    // Right
    this.bgGraphics.fillRect(w*0.8, h*0.15, w*0.2, h);
    this.bgGraphics.fillRect(w*0.85, h*0.05, w*0.1, h);

    // Windows
    this.bgGraphics.fillStyle(0xffaa00, 0.3);
    for(let i=0; i<5; i++) {
        this.bgGraphics.fillRect(w*0.1, h*0.3 + i*100, 40, 60);
        this.bgGraphics.fillRect(w*0.85, h*0.25 + i*100, 40, 60);
    }
  }

  private createCrowd(w: number, h: number) {
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = h - Phaser.Math.Between(10, 60);
      
      const fig = this.add.container(x, y).setDepth(20);
      const head = this.add.circle(0, -20, 8, 0x000000);
      const body = this.add.rectangle(0, 0, 10, 20, 0x000000);
      
      const armL = this.add.rectangle(-8, -5, 4, 15, 0x000000).setAngle(20);
      const armR = this.add.rectangle(8, -5, 4, 15, 0x000000).setAngle(-20);
      
      fig.add([head, body, armL, armR]);
      (fig as any).baseY = y;
      (fig as any).armL = armL;
      (fig as any).armR = armR;
      this.crowdFigures.push(fig);

      // Sway
      this.tweens.add({
        targets: fig,
        x: x + (Math.random() > 0.5 ? 10 : -10),
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private animateCrowdReaction(type: 'jump' | 'miss') {
    if (this.kallolMode && type === 'miss') return; // crowd wild in kallol

    this.crowdFigures.forEach(fig => {
      if (Math.random() > 0.3) {
        if (type === 'jump' || this.kallolMode) {
          this.tweens.add({
            targets: fig,
            y: (fig as any).baseY - 20 - Math.random() * 20,
            duration: 150,
            yoyo: true,
            ease: 'Power1'
          });
          (fig as any).armL.setAngle(-150);
          (fig as any).armR.setAngle(150);
          this.time.delayedCall(300, () => {
             (fig as any).armL.setAngle(20);
             (fig as any).armR.setAngle(-20);
          });
        } else {
          // Miss - cover ears
          (fig as any).armL.setAngle(120);
          (fig as any).armR.setAngle(-120);
          this.time.delayedCall(500, () => {
             (fig as any).armL.setAngle(20);
             (fig as any).armR.setAngle(-20);
          });
        }
      }
    });
  }

  private createShockwave(x: number, y: number, color: number) {
    let radius = 10;
    const wave = { r: radius, alpha: 1 };
    
    this.tweens.add({
        targets: wave,
        r: 150,
        alpha: 0,
        duration: 400,
        onUpdate: () => {
            this.shockwaveGraphics.lineStyle(4, color, wave.alpha);
            this.shockwaveGraphics.strokeCircle(x, y, wave.r);
        },
        onComplete: () => {
            this.shockwaveGraphics.clear();
        }
    });
  }

  private generateTextures() {
    const g = this.add.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 16, 16);
    g.generateTexture('note_circle', 32, 32);
    g.clear();

    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture('gulal', 16, 16);
  }

  private createUI(width: number, height: number) {
    this.add.text(40, 40, 'JOSH METER', { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setDepth(10);
    const joshBg = this.add.rectangle(40, 70, 300, 24, 0x333333).setOrigin(0, 0.5).setDepth(10).setStrokeStyle(2, 0xffffff);
    this.joshBarFill = this.add.rectangle(40, 70, 150, 24, 0xffaa00).setOrigin(0, 0.5).setDepth(10);
    this.joshText = this.add.text(350, 70, '50%', { fontSize: '18px', color: '#ffffff' }).setOrigin(0, 0.5).setDepth(10);

    this.bpmText = this.add.text(width - 150, 40, 'BPM: 95', { fontSize: '24px', color: '#ff6600', fontStyle: 'bold' }).setDepth(10);
    this.tweens.add({
        targets: this.bpmText,
        scale: 1.1,
        duration: 315, // matches 95 bpm roughly
        yoyo: true,
        repeat: -1
    });

    this.statusText = this.add.text(width / 2, height / 3, '', {
      fontSize: '48px', color: '#ffd700', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(100);

    this.comboText = this.add.text(width / 2, 100, '', {
      fontSize: '32px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);
  }

  private generateBeatMap() {
    let noteTime = START_DELAY_MS;
    const totalBars = 48;
    let noteId = 0;

    for (let bar = 0; bar < totalBars; bar++) {
      let bpm = 95;
      if (bar >= 16) bpm = 135;
      if (bar >= 32) bpm = 175;
      
      const beatDuration = 60000 / bpm;
      const isCall = (bar % 2 === 0);

      for (let beat = 0; beat < 4; beat++) {
        const time = noteTime + beat * beatDuration;
        
        this.notes.push({
          id: noteId++, time, lane: Phaser.Math.Between(0, 3), isCall, hit: false, missed: false
        });

        if (Math.random() > 0.4) {
          this.notes.push({
            id: noteId++, time: time + beatDuration / 2, lane: Phaser.Math.Between(0, 3), isCall, hit: false, missed: false
          });
        }
      }
      noteTime += 4 * beatDuration;
    }
  }

  private spawnNoteSprite(note: NoteData) {
    const x = this.laneXs[note.lane];
    const y = -50;
    
    const container = this.add.container(x, y).setDepth(5);
    
    const color = note.isCall ? 0xffffff : LANE_COLORS[note.lane];
    const circle = this.add.sprite(0, 0, 'note_circle').setTint(color);
    
    const ring = this.add.circle(0, 0, 18).setStrokeStyle(3, 0xffffff, 0.8);
    
    container.add([circle, ring]);
    note.sprite = container;

    if (note.isCall) {
      this.tweens.add({
        targets: ring,
        scale: 1.3,
        alpha: 0,
        duration: 400,
        repeat: -1
      });
    }
  }

  private handleHit(laneIdx: number) {
    const flash = this.add.rectangle(this.laneXs[laneIdx], this.cameras.main.height / 2, 90, this.cameras.main.height, LANE_COLORS[laneIdx], 0.4).setDepth(1);
    this.tweens.add({
      targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy()
    });

    if (laneIdx === 0) this.synth.playDholBass();
    else if (laneIdx === 1) this.synth.playDholTreble();
    else this.synth.playTasha();

    const upcomingNotes = this.notes.filter(n => n.lane === laneIdx && !n.hit && !n.missed && n.time >= this.elapsedMs - 200);
    if (upcomingNotes.length === 0) return;

    upcomingNotes.sort((a, b) => a.time - b.time);
    const target = upcomingNotes[0];
    
    const diff = Math.abs(target.time - this.elapsedMs);
    
    if (diff > 250) {
      return; 
    }

    target.hit = true;
    if (target.sprite) {
      target.sprite.destroy();
      target.sprite = undefined;
    }

    let judgment = '';
    let joshDelta = 0;

    if (diff <= 50) {
      judgment = 'PERFECT!';
      joshDelta = 3;
      this.combo++;
      this.cameras.main.shake(100, 0.005);
      this.vfx.burstSparks(this.laneXs[laneIdx], this.strikeY, 15);
      this.spawnGulal(this.laneXs[laneIdx], this.strikeY);
      this.animateCrowdReaction('jump');
      this.createShockwave(this.laneXs[laneIdx], this.strikeY, LANE_COLORS[laneIdx]);
    } else if (diff <= 120) {
      judgment = 'GREAT';
      joshDelta = 1.5;
      this.combo++;
      this.vfx.burstSparks(this.laneXs[laneIdx], this.strikeY, 8);
    } else if (diff <= 200) {
      judgment = 'GOOD';
      joshDelta = 0.5;
      this.combo++;
    } else {
      judgment = 'MISS';
      joshDelta = -5;
      this.combo = 0;
      this.animateCrowdReaction('miss');
    }

    this.updateJosh(joshDelta);
    this.showJudgment(this.laneXs[laneIdx], this.strikeY - 50, judgment, diff <= 50 ? 0xffd700 : 0xffffff);
    this.updateComboUI();
  }

  private handleMiss(note: NoteData) {
    note.missed = true;
    if (note.sprite) {
      this.tweens.add({
        targets: note.sprite,
        alpha: 0,
        y: note.sprite.y + 100,
        duration: 300,
        onComplete: () => {
          note.sprite?.destroy();
          note.sprite = undefined;
        }
      });
    }
    
    this.combo = 0;
    this.updateComboUI();
    this.updateJosh(-5);
    this.showJudgment(this.laneXs[note.lane], this.strikeY + 50, 'MISS', 0xff4444);
    this.animateCrowdReaction('miss');
  }

  private updateJosh(delta: number) {
    if (this.kallolMode && delta > 0) {
      this.josh = 100;
      return;
    }

    this.josh = Phaser.Math.Clamp(this.josh + delta, 0, 100);
    
    this.tweens.add({
      targets: this.joshBarFill,
      width: (this.josh / 100) * 300,
      duration: 100
    });
    this.joshText.setText(`${Math.floor(this.josh)}%`);

    if (this.josh === 100 && !this.kallolMode) {
      this.triggerKallolMode();
    }

    if (this.josh === 0 && !this.gameOver) {
      this.endGame(false);
    }
  }

  private triggerKallolMode() {
    this.kallolMode = true;
    this.joshBarFill.setFillStyle(0xffffff);
    
    this.cameras.main.flash(500, 255, 100, 0); // Saffron flash
    this.bgGraphics.fillStyle(0xff6600, 0.4);
    this.bgGraphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    this.vfx.burstFireworks(this.cameras.main.width / 2, this.cameras.main.height / 2);
    
    const kallolText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'KALLOL FRENZY!', {
      fontSize: '64px', color: '#ff6600', fontStyle: 'bold', stroke: '#fff', strokeThickness: 8
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: kallolText,
      scale: 1.5,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => kallolText.destroy()
    });

    // Make crowd go wild continually
    this.time.addEvent({
        delay: 400,
        repeat: -1,
        callback: () => {
            if (this.kallolMode) this.animateCrowdReaction('jump');
            
            // Random gulal explosions everywhere
            if (this.kallolMode) {
                this.spawnGulal(Phaser.Math.Between(0, this.cameras.main.width), Phaser.Math.Between(100, this.cameras.main.height - 200));
            }
        }
    });

    this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        if (!this.isPlaying || this.gameOver) return;
        if (this.kallolMode) {
          this.josh -= 2;
          if (this.josh < 80) {
            this.kallolMode = false;
            this.joshBarFill.setFillStyle(0xffaa00);
            this.drawStreetBackdrop(this.cameras.main.width, this.cameras.main.height); // reset bg
          }
          this.updateJosh(0);
        }
      }
    });
  }

  private spawnGulal(x: number, y: number) {
    const colors = [0xff6600, 0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    const emitter = this.add.particles(x, y, 'gulal', {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: colors,
      gravityY: 600,
      lifespan: 1000,
      quantity: 25,
      emitting: false
    }).setDepth(20);
    emitter.explode();
    
    this.time.delayedCall(1200, () => emitter.destroy());
  }

  private showJudgment(x: number, y: number, text: string, color: number) {
    const t = this.add.text(x, y, text, {
      fontSize: '24px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setTint(color).setDepth(30);

    this.tweens.add({
      targets: t,
      y: y - 40,
      alpha: 0,
      duration: 500,
      onComplete: () => t.destroy()
    });
  }

  private updateComboUI() {
    if (this.combo > 5) {
      this.comboText.setText(`${this.combo} COMBO!`);
      this.tweens.add({
        targets: this.comboText,
        scale: { from: 1.2, to: 1 },
        duration: 100
      });
    } else {
      this.comboText.setText('');
    }
  }

  update(_time: number, delta: number) {
    if (!this.isPlaying || this.gameOver) return;
    
    this.elapsedMs += delta;

    let activeNotes = 0;
    
    // BPM update based on elapsed time mapping
    let newBpm = 95;
    const barDuration95 = 60000/95 * 4;
    const barDuration135 = 60000/135 * 4;
    if (this.elapsedMs > START_DELAY_MS + 16 * barDuration95) newBpm = 135;
    if (this.elapsedMs > START_DELAY_MS + 16 * barDuration95 + 16 * barDuration135) newBpm = 175;
    
    if (newBpm !== this.currentBpm) {
        this.currentBpm = newBpm;
        this.bpmText.setText(`BPM: ${this.currentBpm}`);
        // update pulse tween (just roughly by recreating it)
        this.tweens.killTweensOf(this.bpmText);
        this.tweens.add({
            targets: this.bpmText,
            scale: 1.1,
            duration: 60000 / this.currentBpm / 2,
            yoyo: true,
            repeat: -1
        });
    }
    
    for (const note of this.notes) {
      if (note.hit || note.missed) continue;

      const timeUntilNote = note.time - this.elapsedMs;
      
      const spawnWindow = (this.strikeY / NOTE_SPEED);
      if (!note.sprite && timeUntilNote <= spawnWindow && timeUntilNote > 0) {
        this.spawnNoteSprite(note);
      }

      if (note.sprite) {
        note.sprite.y = this.strikeY - (timeUntilNote * NOTE_SPEED);
      }

      if (timeUntilNote < -200) {
        this.handleMiss(note);
      } else {
        activeNotes++;
      }
    }

    if (activeNotes === 0 && this.notes.length > 0 && this.notes[this.notes.length - 1].time < this.elapsedMs - 1000) {
      if (this.josh >= 25) {
        this.endGame(true);
      } else {
        this.endGame(false);
      }
    }
  }

  private endGame(won: boolean) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.isPlaying = false;

    this.statusText.setAlpha(1);

    if (won) {
      this.audio.playStageClear();
      this.vfx.burstFireworks(this.cameras.main.width / 2, this.cameras.main.height / 3);
      this.cameras.main.flash(200, 255, 215, 0);
      this.statusText.setText('FESTIVAL SUCCESS!').setColor('#ffd700');

      const medal = this.josh >= 90 ? 'GOLD' : this.josh >= 60 ? 'SILVER' : 'BRONZE';

      this.time.delayedCall(2000, () => {
        EventBus.emit('ui-sfx', 'perfect');
        if (this.onWinCallback) this.onWinCallback(medal);
      });
    } else {
      this.audio.playHurt();
      this.cameras.main.shake(400, 0.01);
      this.statusText.setText('JOSH LOST...').setColor('#ff4444');

      this.time.delayedCall(2000, () => {
        if (this.onFailCallback) this.onFailCallback();
      });
    }
  }
}
