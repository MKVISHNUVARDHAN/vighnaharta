import Phaser from "phaser";
import { Procession } from "../entities/Procession";
import { EventBus } from "../EventBus";
import { AudioSystem } from "../systems/AudioSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { JourneyPlaySystem } from "../systems/JourneyPlaySystem";
import { VFXSystem } from "../systems/VFXSystem";
import { CityMap, STAGE_LOCATIONS } from "../systems/CityMap";
import { NPCBarkSystem } from "../systems/NPCBarkSystem";
import type { RunStats, Vec2 } from "@/types/game";

const PROCESSION_LIMITS = [1, 3, 6, 9, 12, 15];

const emptyStats = (): RunStats => ({
  score: 0, perfectTurns: 0, goodTurns: 0, totalTurns: 6,
  dodges: 0, precisionDodges: 0, clutches: 0, shortcuts: 0,
  rangolisFound: [], maxCombo: 0, maxFlow: 100, flowActivations: 0,
  timeElapsed: 0, routeNodes: [], routeRoads: [], hits: 0,
  wrongChoices: 0, grade: "C",
});

export class GameScene extends Phaser.Scene {
  private playSystem!: JourneyPlaySystem;
  private cam!: CameraSystem;
  private cityMap!: CityMap;
  private npcSystem!: NPCBarkSystem;
  private STOPS: { x: number, y: number, title: string, icon: string }[] = [];
  private PROCESSION_POINTS: Vec2[] = [];

  // Dash state
  private dashUntil = 0;
  private dashReady = 0;
  private touchDash = false;
  private wasDashing = false;

  // Movement state
  private velocityX = 0;
  private velocityY = 0;
  private lastFootstep = 0;
  private squashTween?: Phaser.Tweens.Tween;

  private procession!: Procession;
  private mooshak!: Phaser.Physics.Arcade.Sprite;
  private mooshakShadow!: Phaser.GameObjects.Ellipse;
  private mooshakTag!: Phaser.GameObjects.Text;
  private destination!: Phaser.GameObjects.Arc;
  private audio!: AudioSystem;
  private vfx!: VFXSystem;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private markers: Phaser.GameObjects.Container[] = [];
  private cleared: boolean[] = Array(6).fill(false);
  private activeStage = 0;
  private challengeTriggered = false;
  private challengeActive = false;
  private target: Vec2 | null = null;
  private guide!: Phaser.GameObjects.Graphics;
  private processionPathIndex = 0;
  private startedAt = 0;
  private rain?: Phaser.GameObjects.Particles.ParticleEmitter;
  private promptBadge!: Phaser.GameObjects.Container;
  private lastPetal = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    this.markers = [];
    this.cleared = Array(6).fill(false);
    this.activeStage = 0;
    this.challengeTriggered = false;
    this.challengeActive = false;
    this.target = null;
    this.processionPathIndex = 0;
    this.startedAt = this.time.now;
    this.velocityX = 0;
    this.velocityY = 0;
    this.wasDashing = false;

    // === CITYMAP & NPC SYSTEM ===
    this.cityMap = new CityMap(this);
    this.cityMap.generate();
    this.cityMap.render();

    this.npcSystem = new NPCBarkSystem(this);
    this.npcSystem.init(this.cityMap);

    this.STOPS = STAGE_LOCATIONS.map(loc => {
      const p = CityMap.toScreen(loc.gx, loc.gy);
      return { x: p.x, y: p.y, title: loc.name, icon: loc.icon };
    });

    this.PROCESSION_POINTS = [
      { x: 15, y: 28 }, { x: 15, y: 25 },
      { x: 12, y: 23 }, { x: 8, y: 20 },
      { x: 10, y: 18 }, { x: 15, y: 16 }, { x: 22, y: 16 },
      { x: 18, y: 14 }, { x: 10, y: 12 },
      { x: 12, y: 10 }, { x: 18, y: 8 }, { x: 20, y: 7 },
      { x: 18, y: 5 }, { x: 15, y: 3 },
    ].map(p => CityMap.toScreen(p.x, p.y));

    // === SYSTEMS ===
    this.audio = new AudioSystem(this);
    this.audio.init();
    this.vfx = new VFXSystem(this);
    this.vfx.init();
    this.cam = new CameraSystem(this);
    this.cam.init(this.cityMap.worldWidth, this.cityMap.worldHeight);

    this.dashUntil = 0;
    this.dashReady = 0;
    this.playSystem = new JourneyPlaySystem(this, this.PROCESSION_POINTS, this.vfx);
    this.playSystem.publish();

    // === BUILD WORLD ===
    this.buildWorld();

    // === MOOSHAK ANIMATION ===
    if (!this.anims.exists("mooshak-run")) {
      this.anims.create({
        key: "mooshak-run",
        frames: this.anims.generateFrameNumbers("mooshak-run-v1", { start: 0, end: 7 }),
        frameRate: 12,
        repeat: -1,
      });
    }

    // === PROCESSION ===
    this.procession = new Procession(this, this.PROCESSION_POINTS[0].x, this.PROCESSION_POINTS[0].y)
      .setScale(0.76)
      .setDepth(this.PROCESSION_POINTS[0].y);

    // === MOOSHAK with proper shadow and feel ===
    this.mooshakShadow = this.add
      .ellipse(this.cityMap.spawnX, this.cityMap.spawnY, 60, 20, 0x000000, 0.35)
      .setDepth(this.cityMap.spawnY - 6);

    this.mooshak = this.physics.add
      .sprite(this.cityMap.spawnX, this.cityMap.spawnY, "mooshak-run-v1", 0)
      .setScale(0.22)
      .setOrigin(0.5, 0.88)
      .setDepth(this.cityMap.spawnY)
      .setCollideWorldBounds(true);

    this.physics.world.setBounds(0, 0, this.cityMap.worldWidth, this.cityMap.worldHeight);

    this.mooshakTag = this.add
      .text(this.cityMap.spawnX, this.cityMap.spawnY - 86, "YOU · MOOSHAK", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#071020",
        fontStyle: "bold",
        backgroundColor: "#ffd66b",
        padding: { x: 9, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(2600);

    this.destination = this.add
      .circle(this.cityMap.spawnX, this.cityMap.spawnY, 18, 0x000000, 0)
      .setStrokeStyle(4, 0x79e5bf, 0.95)
      .setDepth(2550)
      .setVisible(false);

    this.mooshak.body!.setSize(185, 105, true);

    this.guide = this.add.graphics().setDepth(2500);

    // === INPUT ===
    this.setupInput();

    // === CAMERA ===
    this.cam.follow(this.mooshak, -110);
    this.cam.fadeIn(850);

    this.markers.forEach((m, i) => m.setAlpha(i === 0 ? 1 : 0.22));
    this.time.delayedCall(120, () => this.updateObjective());
    EventBus.emit("progress-changed", 0);
    EventBus.emit("clock-changed", 480);

    // === FESTIVAL ATMOSPHERE ===
    // Spawn floating lights throughout the city
    for (let i = 0; i < 8; i++) {
      const fx = Phaser.Math.Between(100, this.cityMap.worldWidth - 100);
      const fy = Phaser.Math.Between(100, this.cityMap.worldHeight - 100);
      this.vfx.floatingLights(fx, fy, 3);
    }

    // === EVENT BUS ===
    EventBus.on("journey-dash", this.requestDash, this);
    EventBus.on("challenge-cleared", this.clearChallenge, this);
    EventBus.on("journey-timeout", this.timeoutJourney, this);
    EventBus.on("challenge-active", this.setChallengeActive, this);
    EventBus.on("ui-sfx", this.playUiSfx, this);
    
    // Minigame bridge handlers — maps stage index to Phaser scene key
    const STAGE_SCENES = ['RoadRallyScene', 'ModakCatchScene', 'FlowerFestivalScene', 'DholUtsavScene', 'MonsoonCrossingScene', 'RangoliLightScene'];
    
    const startChallenge = (data: any) => {
      const sceneKey = STAGE_SCENES[data.stage];
      if (sceneKey) {
        this.scene.launch(sceneKey, { onWin: data.onWin, onFail: data.onFail, assisted: data.assisted });
        this.scene.bringToTop(sceneKey);
        this.scene.pause();
      }
    };
    const stopChallenge = (data: any) => {
      const sceneKey = STAGE_SCENES[data.stage];
      if (sceneKey && this.scene.isActive(sceneKey)) {
        this.scene.stop(sceneKey);
      }
      this.challengeTriggered = false;
      this.scene.resume();
    };
    
    EventBus.on("start-phaser-challenge", startChallenge);
    EventBus.on("stop-phaser-challenge", stopChallenge);

    this.events.once("shutdown", () => {
      EventBus.off("journey-dash", this.requestDash, this);
      EventBus.off("challenge-cleared", this.clearChallenge, this);
      EventBus.off("journey-timeout", this.timeoutJourney, this);
      EventBus.off("challenge-active", this.setChallengeActive, this);
      EventBus.off("ui-sfx", this.playUiSfx, this);
      EventBus.off("start-phaser-challenge", startChallenge);
      EventBus.off("stop-phaser-challenge", stopChallenge);
      this.rain?.destroy();
      this.audio.destroy();
      this.vfx.destroy();
      this.npcSystem.destroy();
    });
  }

  update(time: number, delta: number) {
    this.moveMooshak(delta, time);
    if (!this.challengeActive) this.playSystem.update(time, this.mooshak, time < this.dashUntil);
    this.moveProcession(delta);
    this.procession.updatePerformance(time);
    this.cam.update(time, delta, this.velocityX, this.velocityY);
    this.vfx.update(time, delta);
    this.drawGuide(time);
    
    this.npcSystem.update(this.mooshak.x, this.mooshak.y, time);

    // Depth sorting
    this.procession.setDepth(this.procession.y);
    this.mooshak.setDepth(this.mooshak.y + 60);
    this.mooshakShadow
      .setPosition(this.mooshak.x, this.mooshak.y)
      .setDepth(this.mooshak.y + 45);
    this.mooshakTag.setPosition(this.mooshak.x, this.mooshak.y - 86);

    if (this.target)
      this.destination.setPosition(this.target.x, this.target.y).setVisible(true);
    else this.destination.setVisible(false);

    // Stage arrival check — interactive prompt, NOT auto-forced!
    if (this.activeStage < 6 && !this.challengeTriggered && !this.challengeActive) {
      const s = this.STOPS[this.activeStage];
      const dist = Phaser.Math.Distance.Between(this.mooshak.x, this.mooshak.y, s.x, s.y);
      if (dist < 145) {
        this.promptBadge.setPosition(s.x, s.y - 75).setVisible(true);
        // Press E (anywhere in range) or Space (when near < 115px) or step onto altar (< 48px)
        const ePressed = Phaser.Input.Keyboard.JustDown(this.keys.E);
        const spacePressed = Phaser.Input.Keyboard.JustDown(this.keys.SPACE) && dist < 115;
        if (ePressed || spacePressed || dist < 48) {
          this.promptBadge.setVisible(false);
          this.arriveAt(this.activeStage);
        }
      } else {
        this.promptBadge.setVisible(false);
      }
    } else {
      this.promptBadge?.setVisible(false);
    }

    // Ambient petals near procession
    if (!this.challengeActive && time - this.lastPetal > 500) {
      this.lastPetal = time;
      this.vfx.burstPetals(
        this.procession.x + Phaser.Math.Between(-35, 35),
        this.procession.y, 2,
      );
    }

  }

  private buildWorld() {
    // Stage stop markers
    this.STOPS.forEach((stop, i) => {
      const m = this.add.container(stop.x, stop.y);

      // Glowing ground circle
      const groundGlow = this.add.ellipse(0, 12, 70, 30, 0x66ccff, 0.15)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: groundGlow,
        scaleX: 1.15, scaleY: 1.15,
        alpha: 0.25,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      const shadow = this.add.ellipse(0, 12, 60, 25, 0x000000, 0.4);
      const base = this.add.circle(0, 0, 24, 0x112233)
        .setStrokeStyle(3, 0x66ccff);
      const icon = this.add.text(0, 0, stop.icon, {
        fontFamily: "Arial", fontSize: "22px", color: "#ffffff",
      }).setOrigin(0.5);

      // Floating animation
      this.tweens.add({
        targets: [base, icon],
        y: -6,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      m.add([groundGlow, shadow, base, icon]);
      m.setDepth(stop.y - 10);
      m.setInteractive(new Phaser.Geom.Circle(0, 0, 52), Phaser.Geom.Circle.Contains);
      m.input?.cursor && (m.input.cursor = "pointer");
      m.on("pointerdown", () => {
        if (this.activeStage === i && !this.challengeActive) {
          this.promptBadge.setVisible(false);
          this.arriveAt(i);
        }
      });
      this.markers.push(m);

      // Title label on all markers
      this.add.text(stop.x, stop.y - 46, stop.title, {
        fontFamily: "Arial", fontSize: "12px", color: i === 0 ? "#ffd700" : "#aaccff",
        fontStyle: "bold", stroke: "#000000", strokeThickness: 3,
      }).setOrigin(0.5).setDepth(stop.y + 20).setAlpha(0.9);
    });

    // Floating interaction prompt badge for altar inspection (fully clickable!)
    this.promptBadge = this.add.container(0, 0).setDepth(6000).setVisible(false);
    const badgeBg = this.add.rectangle(0, 0, 240, 36, 0x0a1020, 0.94)
      .setStrokeStyle(2, 0xffd700, 0.95);
    const badgeText = this.add.text(0, 0, "✦ [E] OR CLICK TO HELP ✦", {
      fontFamily: "Arial", fontSize: "12px", color: "#ffd700", fontStyle: "bold"
    }).setOrigin(0.5);
    this.promptBadge.add([badgeBg, badgeText]);
    this.promptBadge.setInteractive(new Phaser.Geom.Rectangle(-120, -18, 240, 36), Phaser.Geom.Rectangle.Contains);
    this.promptBadge.on("pointerdown", () => {
      if (this.activeStage < 6 && !this.challengeActive) {
        this.promptBadge.setVisible(false);
        this.arriveAt(this.activeStage);
      }
    });
  }

  // ============================================================
  // MOVEMENT — game feel with acceleration, squash, particles
  // ============================================================
  private requestDash() { this.touchDash = true; }

  private setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,E,SHIFT,SPACE") as Record<string, Phaser.Input.Keyboard.Key>;
    
    // Capture keys so browser window doesn't steal arrow key scrolling
    this.input.keyboard?.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.E,
    ]);

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.game.canvas.focus();
      if (!this.challengeActive) {
        let tx = Phaser.Math.Clamp(p.worldX, 38, this.cityMap.worldWidth - 38);
        let ty = Phaser.Math.Clamp(p.worldY, 38, this.cityMap.worldHeight - 38);
        if (this.cityMap.isScreenPosWalkable(tx, ty)) {
          this.target = { x: tx, y: ty };
          this.tweens.add({
            targets: this.destination,
            scale: 1.6, alpha: 0.2, duration: 260, yoyo: true,
          });
        }
      }
    });
  }

  private moveMooshak(delta: number, time: number) {
    if (this.challengeActive) {
      this.mooshak.setVelocity(0);
      this.velocityX = 0;
      this.velocityY = 0;
      return;
    }

    // Input direction
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) dx--;
    if (this.cursors.right.isDown || this.keys.D.isDown) dx++;
    if (this.cursors.up.isDown || this.keys.W.isDown) dy--;
    if (this.cursors.down.isDown || this.keys.S.isDown) dy++;

    if (dx || dy) this.target = null;
    else if (this.target) {
      const d = Phaser.Math.Distance.Between(this.mooshak.x, this.mooshak.y, this.target.x, this.target.y);
      if (d > 12) {
        dx = (this.target.x - this.mooshak.x) / d;
        dy = (this.target.y - this.mooshak.y) / d;
      } else this.target = null;
    }

    const n = Math.hypot(dx, dy) || 1;

    // === DASH ===
    const dashRequested = Phaser.Input.Keyboard.JustDown(this.keys.SHIFT) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || this.touchDash;
    this.touchDash = false;
    if (dashRequested && time >= this.dashReady && (dx || dy)) {
      this.dashUntil = time + 260;
      this.dashReady = time + 1100;
      this.audio.playDashStart();
      this.vfx.burstPetals(this.mooshak.x, this.mooshak.y, 15);
      this.vfx.dustPuff(this.mooshak.x, this.mooshak.y + 10);
      this.cam.punch(-(dx / n) * 6, -(dy / n) * 6); // Punch away from dash direction

      // Squash on dash start (anticipation)
      this.squashTween?.destroy();
      this.squashTween = this.tweens.add({
        targets: this.mooshak,
        scaleX: 0.26, scaleY: 0.18,
        duration: 60,
        yoyo: true,
        ease: "Cubic.easeOut",
        onComplete: () => this.mooshak.setScale(0.22),
      });
    }

    const isDashing = time < this.dashUntil;
    const speed = isDashing ? 620 : 265;

    // Smooth acceleration (exponential blend)
    const blendFactor = 1 - Math.exp(-delta / (isDashing ? 15 : 65));
    const targetVx = (dx / n) * speed;
    const targetVy = (dy / n) * speed;
    const currentVx = this.mooshak.body!.velocity.x;
    const currentVy = this.mooshak.body!.velocity.y;
    const newVx = Phaser.Math.Linear(currentVx, targetVx * (dx || dy ? 1 : 0), blendFactor);
    const newVy = Phaser.Math.Linear(currentVy, targetVy * (dx || dy ? 1 : 0), blendFactor);
    
    // Collision check — test X and Y independently for wall-sliding
    const nextX = this.mooshak.x + (newVx * delta) / 1000;
    const nextY = this.mooshak.y + (newVy * delta) / 1000;
    
    let finalVx = newVx;
    let finalVy = newVy;
    
    if (!this.cityMap.isScreenPosWalkable(nextX, this.mooshak.y)) {
      finalVx = 0; // Blocked horizontally, but can still slide vertically
    }
    if (!this.cityMap.isScreenPosWalkable(this.mooshak.x, nextY)) {
      finalVy = 0; // Blocked vertically, but can still slide horizontally
    }
    // Both blocked = full stop
    if (!this.cityMap.isScreenPosWalkable(nextX, nextY) && finalVx !== 0 && finalVy !== 0) {
      finalVx = 0;
      finalVy = 0;
      this.target = null;
    }
    
    this.mooshak.setVelocity(finalVx, finalVy);
    this.velocityX = finalVx;
    this.velocityY = finalVy;

    // === DASH TRAIL ===
    if (isDashing && (dx || dy)) {
      this.vfx.trailEffect(this.mooshak, 0xffd45e);
    }

    // === DASH END: landing squash ===
    if (this.wasDashing && !isDashing) {
      this.audio.playDashEnd();
      this.vfx.dustPuff(this.mooshak.x, this.mooshak.y + 10);
      this.squashTween?.destroy();
      this.squashTween = this.tweens.add({
        targets: this.mooshak,
        scaleX: 0.18, scaleY: 0.26, // Stretch vertically on landing
        duration: 80,
        yoyo: true,
        ease: "Bounce.easeOut",
        onComplete: () => this.mooshak.setScale(0.22),
      });
    }
    this.wasDashing = isDashing;

    // === VISUAL FEEDBACK ===
    // Flip based on horizontal direction
    if (dx < 0) this.mooshak.setFlipX(true);
    if (dx > 0) this.mooshak.setFlipX(false);

    // Lean angle proportional to horizontal speed
    const leanAngle = (newVx / speed) * 8;
    const currentSpeed = Math.hypot(newVx, newVy);

    if (dx || dy) {
      this.mooshak.play("mooshak-run", true);
      this.mooshak.setAngle(leanAngle);

      // Footstep sounds with rhythm
      if (time - this.lastFootstep > (isDashing ? 100 : 200)) {
        this.lastFootstep = time;
        this.audio.playFootstep();
        // Tiny dust at feet
        if (!isDashing && currentSpeed > 100) {
          this.vfx.dustPuff(this.mooshak.x + Phaser.Math.Between(-5, 5), this.mooshak.y + 5);
        }
      }
    } else {
      this.mooshak.stop().setFrame(0);
      // Smooth angle recovery
      this.mooshak.setAngle(Phaser.Math.Linear(this.mooshak.angle, 0, 0.15));
    }

    // Shadow follows and scales with speed
    const shadowScale = isDashing ? 0.8 : 1;
    this.mooshakShadow.setScale(shadowScale, shadowScale * 0.4);

    // Dash-ready indicator on shadow
    this.mooshakShadow.setStrokeStyle(
      time >= this.dashReady ? 2 : 0,
      0xffe298,
      time >= this.dashReady ? 0.6 : 0,
    );
  }

  private moveProcession(delta: number) {
    if (this.activeStage >= 6) {
      this.setProcessionMoving(false);
      return;
    }
    const limit = PROCESSION_LIMITS[this.activeStage];
    if (this.processionPathIndex >= limit) {
      this.setProcessionMoving(false);
      return;
    }
    const next = this.PROCESSION_POINTS[this.processionPathIndex + 1];
    const dx = next.x - this.procession.x;
    const dy = next.y - this.procession.y;
    const d = Math.hypot(dx, dy);
    if (d > 3) {
      this.setProcessionMoving(true);
      const step = Math.min(d, (120 * delta) / 1000);
      this.procession.x += (dx / d) * step;
      this.procession.y += (dy / d) * step;
    } else {
      this.processionPathIndex++;
    }
  }


  private setChallengeActive(active: boolean) {
    this.challengeActive = active;
    this.npcSystem.setChallengeActive(active);
    if (active) this.audio.startFestivalMusic();
  }

  private playUiSfx(kind: string) {
    if (kind === "dhol") this.audio.playDholHit();
    else if (kind === "wrong") this.audio.playHurt();
    else if (kind === "slice") this.audio.playWhoosh();
    else this.audio.playGood();
  }

  // ============================================================
  // STAGE CLEAR — layered celebration with maximum juice
  // ============================================================
  private clearChallenge(index: number, medal = "BRONZE") {
    if (this.cleared[index] || index !== this.activeStage) return;
    this.cleared[index] = true;
    this.npcSystem.setClearedStage(index);

    const scoreValue = medal === "GOLD" ? 1500 : medal === "SILVER" ? 1000 : 600;
    this.playSystem.score += scoreValue;
    this.playSystem.publish();

    const s = this.STOPS[index];
    const marker = this.markers[index];

    // === LAYER 1: Hit-stop (3-frame freeze) ===
    this.vfx.hitStop(50);

    // === LAYER 2: Audio — full celebration ===
    this.time.delayedCall(50, () => {
      this.audio.playStageClear();
    });

    // === LAYER 3: Camera — zoom punch + shake + flash ===
    this.cam.punch(0, -12);
    this.cam.shake(300, 0.006);
    this.cam.flash(180, 245, 187, 74);

    // === LAYER 4: Particles — 3 overlapping bursts ===
    // Fast sparks
    this.vfx.burstSparks(s.x, s.y, 30);
    // Medium petals (delayed)
    this.time.delayedCall(80, () => {
      this.vfx.burstPetals(s.x, s.y, 50);
    });
    // Slow fireworks (more delayed)
    this.time.delayedCall(200, () => {
      this.vfx.burstFireworks(s.x, s.y);
    });

    // === LAYER 5: Shockwave ring ===
    this.vfx.shockwave(s.x, s.y, 180);

    // === LAYER 6: Score popup with bounce ===
    this.vfx.scorePopup(s.x, s.y - 40, `+${scoreValue}`, 32, 0xffd45e);
    if (medal === "GOLD") {
      this.time.delayedCall(200, () => {
        this.vfx.scorePopup(s.x, s.y - 70, "★ GOLD ★", 20, 0xffee00);
      });
    }

    // === LAYER 7: Combo flash ===
    const solved = this.cleared.filter(Boolean).length;
    this.vfx.comboFlash(solved);

    // === LAYER 8: Marker celebration ===
    this.tweens.add({
      targets: marker,
      scale: 1.7,
      alpha: 0,
      duration: 650,
      ease: "Cubic.easeOut",
    });

    // Light explosion
    const light = this.add
      .circle(s.x, s.y, 12, 0xffd66b, 0.55)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(s.y - 2);
    this.tweens.add({
      targets: light,
      scale: 22, alpha: 0.06,
      duration: 1200,
      onComplete: () => light.destroy(),
    });

    // === LAYER 9: World reaction ===
    EventBus.emit("progress-changed", (index + 1) / 6);
    EventBus.emit("toast", `${s.title} SHINES AGAIN`, "rangoli");
    this.buildStageReaction(index, s.x, s.y);

    // Festival lights appear at cleared stage
    this.vfx.floatingLights(s.x, s.y, 6);

    if (index === 3) this.startRain();
    if (index === 5) {
      this.activeStage = 6;
      this.time.delayedCall(1800, () => this.finish(true));
      return;
    }

    this.activeStage = index + 1;
    this.challengeTriggered = false;
    const next = this.markers[this.activeStage];
    next.setAlpha(1);
    const icon = next.list[3] as Phaser.GameObjects.Text;
    icon.setText("➜");
    this.time.delayedCall(950, () => this.updateObjective());
  }

  private buildStageReaction(index: number, x: number, y: number) {
    if (index === 0) {
      // Welcome Gate opens
      const left = this.add.rectangle(x - 52, y - 34, 10, 88, 0xd89a38).setDepth(y + 2);
      const right = this.add.rectangle(x + 52, y - 34, 10, 88, 0xd89a38).setDepth(y + 2);
      this.tweens.add({
        targets: [left, right],
        x: (target: Phaser.GameObjects.Rectangle) => target === left ? x - 86 : x + 86,
        duration: 650, ease: "Back.easeOut",
      });
      // Gate arch
      const arch = this.add.graphics().setDepth(y + 5);
      arch.lineStyle(8, 0xffd45e).beginPath()
        .arc(x, y - 34, 52, Math.PI, Math.PI * 2).strokePath();
      arch.setAlpha(0);
      this.tweens.add({ targets: arch, alpha: 1, duration: 400, delay: 300 });
    } else if (index === 1) {
      // Modak baskets fill
      [-34, 0, 34].forEach((offset, i) => {
        const basket = this.add.ellipse(x + offset, y - 12, 30, 16, 0xb5672b)
          .setStrokeStyle(2, 0xffd36a).setDepth(y + i);
        const sweets = this.add.text(x + offset, y - 22, "●●●", {
          color: "#ffd25e", fontSize: "11px",
        }).setOrigin(0.5).setDepth(y + i + 1);
        basket.setScale(0);
        this.tweens.add({
          targets: [basket, sweets],
          scale: 1, duration: 400, ease: "Back.easeOut", delay: i * 120,
        });
      });
    } else if (index === 2) {
      // Garland arch
      const arch = this.add.graphics().setDepth(y + 18);
      arch.lineStyle(11, 0xed8c36).beginPath()
        .arc(x, y + 12, 74, Math.PI, Math.PI * 2).strokePath();
      arch.lineStyle(5, 0xffcc42).beginPath()
        .arc(x, y + 12, 65, Math.PI, Math.PI * 2).strokePath();
      arch.setAlpha(0).setScale(0.5);
      this.tweens.add({
        targets: arch, alpha: 1, scale: 1, duration: 700, ease: "Back.easeOut",
      });
    } else if (index === 3) {
      // Drums appear with bounce
      [-48, -16, 16, 48].forEach((offset, i) => {
        const drum = this.add.ellipse(x + offset, y - 18, 25, 17, i === 3 ? 0xf0c45f : 0xb05f32)
          .setStrokeStyle(2, 0xffe4a0).setDepth(y + i).setScale(0);
        this.tweens.add({
          targets: drum, scale: 1, duration: 300, ease: "Back.easeOut", delay: i * 80,
        });
        this.tweens.add({
          targets: drum,
          scaleX: 1.14, scaleY: 0.86,
          duration: 180 + i * 25, yoyo: true, repeat: 5, delay: 400 + i * 60,
        });
      });
    } else if (index === 4) {
      // Bridge extends
      const bridge = this.add.rectangle(x, y - 4, 145, 42, 0x9a7045)
        .setStrokeStyle(4, 0xe4bb72).setDepth(y + 4).setScale(0, 1);
      this.tweens.add({
        targets: bridge, scaleX: 1, duration: 800, ease: "Back.easeOut",
      });
    } else {
      // Rangoli lamps circle in
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const lamp = this.add.circle(
          x + Math.cos(angle) * 68, y + Math.sin(angle) * 34,
          5, 0xffd45b, 1,
        ).setDepth(y + 20).setScale(0);
        this.tweens.add({
          targets: lamp, scale: 1, duration: 280, delay: i * 70, ease: "Back.easeOut",
        });
        // Glow
        const glow = this.add.circle(
          x + Math.cos(angle) * 68, y + Math.sin(angle) * 34,
          10, 0xffaa33, 0.3,
        ).setBlendMode(Phaser.BlendModes.ADD).setDepth(y + 19).setScale(0);
        this.tweens.add({
          targets: glow, scale: 1, alpha: 0.15, duration: 400, delay: i * 70 + 200,
          yoyo: true, repeat: -1,
        });
      }
    }
  }

  private startRain() {
    this.audio.playClutch();
    this.rain = this.add.particles(0, 0, "petal", {
      x: { min: 0, max: this.cityMap.worldWidth },
      y: -40,
      lifespan: 1500,
      speedY: { min: 500, max: 720 },
      speedX: { min: -90, max: -35 },
      scale: { start: 0.16, end: 0.03 },
      tint: 0x9ed9f1,
      alpha: { start: 0.45, end: 0 },
      quantity: 2,
      frequency: 34,
    }).setDepth(3000);
    this.time.delayedCall(9000, () => this.rain?.stop());
  }

  private timeoutJourney() {
    this.finish(false);
  }

  private finish(success: boolean) {
    const solved = this.cleared.filter(Boolean).length;
    const stats = emptyStats();
    stats.score = this.playSystem.score;
    stats.maxCombo = this.playSystem.maxCombo;
    stats.hits = this.playSystem.hits;
    stats.goodTurns = solved;
    stats.dodges = solved;
    stats.timeElapsed = Math.max(1, Math.round((this.time.now - this.startedAt) / 1000));
    stats.routeRoads = this.STOPS.slice(0, solved).map(s => s.title);
    stats.rangolisFound = success ? ["City of Seva"] : [];
    stats.grade = success ? "S+" : solved >= 4 ? "A" : solved >= 2 ? "B" : "C";

    if (success) {
      this.audio.playStageClear();
    }
    
    this.time.delayedCall(success ? 4000 : 1000, () => {
      EventBus.emit("journey-ended", stats);
    });
  }

  private setProcessionMoving(moving: boolean) {
    this.procession.setMoving(moving);
    if (moving) this.audio.startFestivalMusic();
    else this.audio.stopFestivalMusic();
  }

  private drawGuide(time: number) {
    this.guide.clear();
    if (this.activeStage >= 6 || this.challengeActive) return;
    const s = this.STOPS[this.activeStage];
    const dx = s.x - this.mooshak.x;
    const dy = s.y - this.mooshak.y;
    const d = Math.hypot(dx, dy);
    for (let p = 40 + ((time / 12) % 36); p < d - 42; p += 36) {
      const t = p / d;
      this.guide.fillStyle(
        0xffd66b,
        0.28 + 0.25 * Math.sin((p + time / 7) * 0.05),
      );
      this.guide.fillCircle(
        this.mooshak.x + dx * t,
        this.mooshak.y + dy * t,
        4,
      );
    }
  }

  private updateObjective() {
    if (this.activeStage >= 6) return;
    EventBus.emit(
      "objective-changed",
      `MOOSHAK · ${this.STOPS[this.activeStage].title}`,
      `Collect light · chain pickups · SPACE to dash through obstacles`,
    );
  }

  private arriveAt(index: number) {
    if (this.challengeTriggered) return;
    this.challengeTriggered = true;
    const s = this.STOPS[index];

    // Multi-layered arrival feedback
    this.audio.playImpact();
    this.vfx.burstSparks(s.x, s.y, 20);
    this.cam.shake(220, 0.003);
    this.cam.punch(0, -5);

    EventBus.emit(
      "objective-changed",
      s.title,
      "You found the Vighna · the procession waits until you solve it",
    );
    EventBus.emit("stage-arrived", index);
  }
}
