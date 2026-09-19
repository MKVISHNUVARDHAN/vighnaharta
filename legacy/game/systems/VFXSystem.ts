export class VFXSystem {
  private scene: Phaser.Scene;
  private emitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter>;
  private floatingLightsSprites: { sprite: Phaser.GameObjects.Image, baseX: number, time: number }[];
  private vignette?: Phaser.GameObjects.Rectangle;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.emitters = new Map();
    this.floatingLightsSprites = [];
  }

  init(): void {
    if (!this.scene || !this.scene.sys) return;
    const graphics = this.scene.add.graphics();
    
    // petal
    if (!this.scene.textures.exists('petal')) {
      graphics.clear();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 0, 8, 8);
      graphics.generateTexture('petal', 8, 8);
    }
    
    // spark
    if (!this.scene.textures.exists('spark')) {
      graphics.clear();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 0, 4, 4);
      graphics.generateTexture('spark', 4, 4);
    }
    
    // dust
    if (!this.scene.textures.exists('dust')) {
      graphics.clear();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(4, 4, 4);
      graphics.generateTexture('dust', 8, 8);
    }

    // glow
    if (!this.scene.textures.exists('glow')) {
      graphics.clear();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(16, 16, 16);
      graphics.generateTexture('glow', 32, 32);
    }

    // ring
    if (!this.scene.textures.exists('ring')) {
      graphics.clear();
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeCircle(32, 32, 30);
      graphics.generateTexture('ring', 64, 64);
    }

    graphics.destroy();

    // Create persistent emitters
    const petalEmitter = this.scene.add.particles(0, 0, 'petal', {
      speed: { min: 50, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { min: 0.3, max: 1.0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1500,
      gravityY: 200,
      rotate: { start: 0, end: 360 },
      tint: [0xffa500, 0xffd700, 0xeaa221], // orange, gold, marigold
      emitting: false
    }).setDepth(3500);
    this.emitters.set('petal', petalEmitter);

    const sparkKey = this.scene.textures.exists('spark_01') ? 'spark_01' : (this.scene.textures.exists('particle_flare') ? 'particle_flare' : 'spark');
    const sparkEmitter = this.scene.add.particles(0, 0, sparkKey, {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.15, end: 0 },
      lifespan: { min: 200, max: 400 },
      tint: [0xffffff, 0xffd700],
      blendMode: 'ADD',
      emitting: false
    }).setDepth(3500);
    this.emitters.set('spark', sparkEmitter);
    
    const dustKey = this.scene.textures.exists('smoke_puff_0') ? 'smoke_puff_0' : (this.scene.textures.exists('particle_smoke') ? 'particle_smoke' : 'dust');
    const dustEmitter = this.scene.add.particles(0, 0, dustKey, {
      speed: { min: 20, max: 80 },
      angle: { min: 180, max: 360 },
      scale: { start: dustKey.startsWith('smoke') ? 0.12 : 0.8, end: 0 },
      lifespan: 400,
      tint: 0xffe8c0,
      alpha: { start: 0.6, end: 0 },
      emitting: false
    }).setDepth(1500);
    this.emitters.set('dust', dustEmitter);
  }

  burstPetals(x: number, y: number, count: number): void {
    if (!this.scene || !this.scene.sys) return;
    const emitter = this.emitters.get('petal');
    if (emitter) {
      emitter.setPosition(x, y);
      emitter.explode(count);
    }
  }

  burstSparks(x: number, y: number, count: number): void {
    if (!this.scene || !this.scene.sys) return;
    const emitter = this.emitters.get('spark');
    if (emitter) {
      emitter.setPosition(x, y);
      emitter.explode(count);
    }
  }

  burstFireworks(x: number, y: number): void {
    if (!this.scene || !this.scene.sys) return;
    this.burstSparks(x, y, 20);
    
    setTimeout(() => {
      if (this.scene && this.scene.sys) {
        this.burstPetals(x, y, 15);
      }
    }, 100);

    setTimeout(() => {
      if (this.scene && this.scene.sys) {
        this.floatingLights(x, y, 10);
      }
    }, 200);
  }

  screenPunch(dx: number, dy: number): void {
    if (!this.scene || !this.scene.sys) return;
    const cam = this.scene.cameras.main;
    const origX = cam.scrollX;
    const origY = cam.scrollY;
    
    cam.setScroll(cam.scrollX + dx, cam.scrollY + dy);
    
    this.scene.tweens.add({
      targets: cam,
      scrollX: origX,
      scrollY: origY,
      duration: 100,
      ease: 'Elastic.easeOut'
    });
  }

  hitStop(ms: number): void {
    if (!this.scene || !this.scene.sys) return;
    
    if (this.scene.physics && this.scene.physics.world) {
      this.scene.physics.world.timeScale = 0;
    }
    this.scene.time.timeScale = 0;
    this.scene.tweens.timeScale = 0;
    
    setTimeout(() => {
      if (this.scene && this.scene.sys) {
        if (this.scene.physics && this.scene.physics.world) {
          this.scene.physics.world.timeScale = 1;
        }
        this.scene.time.timeScale = 1;
        this.scene.tweens.timeScale = 1;
      }
    }, ms);
  }

  scorePopup(x: number, y: number, text: string, size: number = 24, color: number = 0xffffff): void {
    if (!this.scene || !this.scene.sys) return;
    
    const txt = this.scene.add.text(x, y, text, {
      fontSize: `${size}px`,
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(4000).setScale(0);

    this.scene.tweens.add({
      targets: txt,
      scale: 1.3,
      y: y - 30,
      duration: 300,
      ease: 'Elastic.easeOut',
      onComplete: () => {
        if (!this.scene || !this.scene.sys) return;
        this.scene.tweens.add({
          targets: txt,
          scale: 1.0,
          y: y - 50,
          alpha: 0,
          duration: 500,
          ease: 'Power2',
          onComplete: () => txt.destroy()
        });
      }
    });
  }

  comboFlash(combo: number): void {
    if (!this.scene || !this.scene.sys) return;
    if (!this.vignette) {
      this.vignette = this.scene.add.rectangle(
        0, 0, 
        this.scene.cameras.main.width, 
        this.scene.cameras.main.height, 
        0xffa500
      )
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(5000)
        .setBlendMode('ADD')
        .setAlpha(0);
    }
    
    const intensity = Math.min(0.5, combo * 0.05);
    
    this.scene.tweens.add({
      targets: this.vignette,
      alpha: intensity,
      duration: 50,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  trailEffect(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image, color: number = 0xffffff): void {
    if (!this.scene || !this.scene.sys || !sprite.active || !sprite.texture) return;
    
    const trail = this.scene.add.image(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name)
      .setOrigin(sprite.originX, sprite.originY)
      .setScale(sprite.scaleX, sprite.scaleY)
      .setRotation(sprite.rotation)
      .setDepth(sprite.depth - 1)
      .setTint(color)
      .setBlendMode('ADD')
      .setAlpha(0.5);
      
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 150,
      onComplete: () => trail.destroy()
    });
  }

  dustPuff(x: number, y: number): void {
    if (!this.scene || !this.scene.sys) return;
    const emitter = this.emitters.get('dust');
    if (emitter) {
      emitter.setPosition(x, y);
      emitter.explode(Phaser.Math.Between(3, 5));
    }
  }

  shockwave(x: number, y: number, radius: number): void {
    if (!this.scene || !this.scene.sys) return;
    const ring = this.scene.add.image(x, y, 'ring')
      .setDepth(3500)
      .setBlendMode('ADD')
      .setScale(0.1);
      
    this.scene.tweens.add({
      targets: ring,
      scale: radius / 30,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy()
    });
  }

  floatingLights(x: number, y: number, count: number): void {
    if (!this.scene || !this.scene.sys) return;
    
    for (let i = 0; i < count; i++) {
      const offsetX = x + Phaser.Math.Between(-30, 30);
      const offsetY = y + Phaser.Math.Between(-20, 20);
      
      const light = this.scene.add.image(offsetX, offsetY, 'glow')
        .setTint(0xffa500)
        .setBlendMode('ADD')
        .setDepth(4000)
        .setScale(Phaser.Math.FloatBetween(0.2, 0.6))
        .setAlpha(0);

      const duration = Phaser.Math.Between(3000, 5000);
      
      this.scene.tweens.add({
        targets: light,
        alpha: { start: 0, end: 0.6, yoyo: true, duration: duration / 2 },
        y: offsetY - Phaser.Math.Between(100, 200),
        duration: duration,
        onComplete: () => {
          this.floatingLightsSprites = this.floatingLightsSprites.filter(s => s.sprite !== light);
          light.destroy();
        }
      });
      
      this.floatingLightsSprites.push({
        sprite: light,
        baseX: offsetX,
        time: Math.random() * Math.PI * 2
      });
    }
  }

  update(time: number, delta: number): void {
    if (!this.scene || !this.scene.sys) return;
    
    for (const light of this.floatingLightsSprites) {
      if (light.sprite && light.sprite.active) {
        light.time += delta * 0.002;
        light.sprite.x = light.baseX + Math.sin(light.time) * 20;
      }
    }
  }

  destroy(): void {
    for (const emitter of this.emitters.values()) {
      if (emitter) emitter.destroy();
    }
    this.emitters.clear();
    
    for (const light of this.floatingLightsSprites) {
      if (light.sprite) light.sprite.destroy();
    }
    this.floatingLightsSprites = [];
    
    if (this.vignette) {
      this.vignette.destroy();
      this.vignette = undefined;
    }
  }
}
