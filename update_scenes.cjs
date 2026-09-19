const fs = require('fs');

// ROAD RALLY
let road = fs.readFileSync('src/game/scenes/RoadRallyScene.ts', 'utf8');

road = road.replace('// Building walls on sides', 
`// Building walls on sides
    g.fillStyle(0x3a2a1a, 1);
    g.fillRect(OFFSET_X - 100, OFFSET_Y, 100, GRID_H * CELL_SIZE);
    g.fillRect(OFFSET_X + GRID_W * CELL_SIZE, OFFSET_Y, 100, GRID_H * CELL_SIZE);
    g.fillStyle(0xcc6600, 1); // Orange roofs
    for (let i=0; i<GRID_H; i+=3) {
      g.fillRect(OFFSET_X - 100, OFFSET_Y + i*CELL_SIZE, 100, 20);
      g.fillRect(OFFSET_X + GRID_W * CELL_SIZE, OFFSET_Y + i*CELL_SIZE, 100, 20);
      // lit yellow windows
      g.fillStyle(0xffff00, 0.8);
      g.fillRect(OFFSET_X - 60, OFFSET_Y + i*CELL_SIZE + 40, 20, 30);
      g.fillRect(OFFSET_X + GRID_W * CELL_SIZE + 40, OFFSET_Y + i*CELL_SIZE + 40, 20, 30);
      g.fillStyle(0xcc6600, 1);
    }
    // Diya lanterns on the road sides
    g.fillStyle(0xffaa00, 1);
    for (let i=0; i<GRID_H; i+=2) {
      g.fillCircle(OFFSET_X - 10, OFFSET_Y + i*CELL_SIZE + 32, 5);
      g.fillCircle(OFFSET_X + GRID_W * CELL_SIZE + 10, OFFSET_Y + i*CELL_SIZE + 32, 5);
    }`);

road = road.replace('// Cart body',
`// Cart body
    const bodyW = w * CELL_SIZE - 8;
    const bodyH = h * CELL_SIZE - 8;
    
    // Custom drawing based on color/type
    if (color === 0x8B4513) {
      // Wooden handcart
      const body = this.add.rectangle(0, 0, bodyW, bodyH, 0x8B4513).setStrokeStyle(2, 0x5c2e00);
      container.add(body);
      const handle = this.add.rectangle(bodyW/2, 0, 10, 20, 0x5c2e00);
      container.add(handle);
    } else if (color === 0xcc4444 || color === 0xaa44aa) {
      // Flower stall
      const body = this.add.rectangle(0, 0, bodyW, bodyH, 0xff99cc).setStrokeStyle(2, 0xff3399);
      container.add(body);
      container.add(this.add.circle(-10, -10, 8, 0xff0000));
      container.add(this.add.circle(10, 10, 8, 0xffff00));
      container.add(this.add.circle(-10, 10, 8, 0xffaa00));
    } else if (color === 0xdd8833 || color === 0xcc8844) {
      // Bullock cart
      const body = this.add.rectangle(0, 0, bodyW, bodyH, 0x5c2e00).setStrokeStyle(2, 0x3d1f00);
      container.add(body);
    } else {
      // Fruit crate
      const body = this.add.rectangle(0, 0, bodyW, bodyH, 0x228B22).setStrokeStyle(2, 0x006400);
      container.add(body);
      container.add(this.add.circle(0, 0, 10, 0xffaa00)); // fruit
    }`);
    
road = road.replace('this.rathGY -= this.rathSpeed * (delta / 1000);',
`// Phase difficulty
    let speedMult = 1;
    if (this.clearedCount >= 4 && this.clearedCount < 7) {
      speedMult = 1.5;
    } else if (this.clearedCount >= 7) {
      speedMult = 2;
      // Pulse screen edges red
      this.cameras.main.flash(100, 255, 0, 0, 0.1);
    }
    this.rathGY -= this.rathSpeed * speedMult * (delta / 1000);`);

road = road.replace('this.vfx.scorePopup(cart.sprite.x, cart.sprite.y - 20, `CLEARED! ${this.clearedCount}/${this.totalCarts}`, 18, 0xffd700);',
`this.vfx.scorePopup(cart.sprite.x, cart.sprite.y - 20, \`CLEARED! \${this.clearedCount}/\${this.totalCarts}\`, 18, 0xffd700);
    // Devotees cheer
    const cheers = ['Shabash!', 'Morya!', 'Ganpati Bappa Morya!'];
    const cheer = cheers[Math.floor(Math.random() * cheers.length)];
    const cx = exitX < OFFSET_X ? exitX - 50 : exitX + 50;
    this.vfx.scorePopup(cx, exitY - 50, cheer, 16, 0xffffff);`);
    
road = road.replace('// === RATH (approaching from bottom) ===',
`// Rumble audio context
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.rumbleOsc = this.audioCtx.createOscillator();
    this.rumbleGain = this.audioCtx.createGain();
    this.rumbleOsc.type = 'sine';
    this.rumbleOsc.frequency.setValueAtTime(40, this.audioCtx.currentTime);
    this.rumbleGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.rumbleOsc.connect(this.rumbleGain);
    this.rumbleGain.connect(this.audioCtx.destination);
    this.rumbleOsc.start();
    
    // === RATH (approaching from bottom) ===`);
    
road = road.replace('export class RoadRallyScene extends Phaser.Scene {',
`export class RoadRallyScene extends Phaser.Scene {
  private audioCtx!: AudioContext;
  private rumbleOsc!: OscillatorNode;
  private rumbleGain!: GainNode;`);

road = road.replace('this.vfx.destroy();',
`this.vfx.destroy();
      if (this.audioCtx) this.audioCtx.close();`);

road = road.replace('this.rath.setDepth(rathScreenPos.y + 100);',
`this.rath.setDepth(rathScreenPos.y + 100);
    // Update rumble gain based on distance
    const distToMooshak = Math.abs(this.rathGY - this.mooshakGY);
    const gain = Math.max(0, 1 - (distToMooshak / 12));
    if (this.rumbleGain) this.rumbleGain.gain.setValueAtTime(gain * 0.5, this.audioCtx.currentTime);`);

road = road.replace('// === INPUT ===',
`// === MINI-MAP ===
    this.minimapBg = this.add.rectangle(width - 70, 70, 100, 120, 0x000000, 0.5).setDepth(10000);
    this.minimapG = this.add.graphics().setDepth(10001);
    
    // === INPUT ===`);

road = road.replace('export class RoadRallyScene extends Phaser.Scene {',
`export class RoadRallyScene extends Phaser.Scene {
  private minimapBg!: Phaser.GameObjects.Rectangle;
  private minimapG!: Phaser.GameObjects.Graphics;`);

road = road.replace('this.rath.setDepth(rathScreenPos.y + 100);',
`this.rath.setDepth(rathScreenPos.y + 100);
    
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
    }`);

fs.writeFileSync('src/game/scenes/RoadRallyScene.ts', road);


// MODAK CATCH
let modak = fs.readFileSync('src/game/scenes/ModakCatchScene.ts', 'utf8');

modak = modak.replace('balconyG.fillStyle(0x7a5a3a);',
`balconyG.fillStyle(0x7a5a3a);
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
      balconyG.fillStyle(0x7a5a3a);`);
      
modak = modak.replace('const body = this.add.circle(0, 0, cfg.radius, cfg.color);',
`// Complex sweet drawing
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
    }`);

modak = modak.replace('const body = this.add.circle(0, 0, cfg.radius, cfg.color, 0.5);',
`const body = this.add.circle(0, 0, cfg.radius, cfg.color, 0.5);`);

modak = modak.replace('a.merging = true;\n    b.merging = true;',
`a.merging = true;
    b.merging = true;
    
    // Golden thread
    const thread = this.add.line(0, 0, a.body.x, a.body.y, b.body.x, b.body.y, 0xffd700, 1).setOrigin(0);
    this.tweens.add({
      targets: thread,
      alpha: 0,
      duration: 150,
      onComplete: () => thread.destroy()
    });
    this.cameras.main.flash(50, 255, 215, 0, 0.1);`);

modak = modak.replace('// Auto-drop timer',
`// Adjust dropping
    const winTarget = this.assisted ? 300 : 500;
    if (this.score >= 200) {
      gravity = 0.45; // Faster
    }
    if (this.score >= 450) {
      // shrink thali visual/physics slightly in next step
    }
    
    // Auto-drop timer`);
    
modak = modak.replace('const gravity = 0.3;',
`let gravity = 0.3;
    if (this.score >= 200) gravity = 0.45;
    
    let thaliScale = 1;
    if (this.score >= 450) thaliScale = 0.8;
    const currentThaliWidth = THALI_WIDTH * thaliScale;
    
    const thaliLeft = 400 - currentThaliWidth / 2;
    const thaliRight = 400 + currentThaliWidth / 2;
    
    this.thaliGraphic.setScale(thaliScale, 1);
    `);
modak = modak.replace('const thaliLeft = 400 - THALI_WIDTH / 2;\n    const thaliRight = 400 + THALI_WIDTH / 2;', '');

modak = modak.replace('this.dropReady = true;\n      this.createPreview();',
`this.dropReady = true;
      this.createPreview();
      // Drop two?
      if (this.score >= 350 && Math.random() > 0.5 && !this.assisted) {
         this.time.delayedCall(200, () => {
            const oldX = this.dropX;
            this.dropX = this.dropX + (Math.random()>0.5?40:-40);
            this.dropSweet();
            this.dropX = oldX;
         });
      }`);

modak = modak.replace('this.score += cfg.score;',
`this.score += cfg.score;
        
        // Milestones
        if (this.score >= 100 && this.score - cfg.score < 100) this.vfx.scorePopup(400, 300, 'MADHAV HALWAI IS IMPRESSED!', 24, 0xffd700);
        if (this.score >= 200 && this.score - cfg.score < 200) this.vfx.scorePopup(400, 300, 'AMAZING BALANCING!', 24, 0xffd700);
        if (this.score >= 300 && this.score - cfg.score < 300) this.vfx.scorePopup(400, 300, 'SWEET MASTER!', 24, 0xffd700);
        if (this.score >= 400 && this.score - cfg.score < 400) this.vfx.scorePopup(400, 300, 'ALMOST THERE!', 24, 0xffd700);
`);

fs.writeFileSync('src/game/scenes/ModakCatchScene.ts', modak);


// FLOWER FESTIVAL
let flower = fs.readFileSync('src/game/scenes/FlowerFestivalScene.ts', 'utf8');

flower = flower.replace('// Garland workshop ambience',
`// Garland workshop ambience
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
`);

flower = flower.replace('// === GARLAND MOULD (target zones on left and right sides) ===',
`// === GARLAND MOULD (target zones on left and right sides) ===
    const mouldBase = this.add.graphics().setDepth(4);
    mouldBase.lineStyle(10, 0x8B4513, 1);
    mouldBase.strokeCircle(OFFSET_X + GRID_W * CELL_PX / 2, OFFSET_Y + GRID_H * CELL_PX / 2, GRID_W * CELL_PX * 0.8);
    mouldBase.lineStyle(2, 0xffd700, 1); // golden cord
    mouldBase.strokeCircle(OFFSET_X + GRID_W * CELL_PX / 2, OFFSET_Y + GRID_H * CELL_PX / 2, GRID_W * CELL_PX * 0.8);
`);

flower = flower.replace('g.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX - 1, CELL_PX - 1);',
`g.fillCircle(x * CELL_PX + CELL_PX/2, y * CELL_PX + CELL_PX/2, CELL_PX/2);
        // Slight glow effect
        g.fillStyle(0xffffff, 0.3);
        g.fillCircle(x * CELL_PX + CELL_PX/3, y * CELL_PX + CELL_PX/3, CELL_PX/4);`);
        
flower = flower.replace("EventBus.emit('ui-sfx', 'perfect');",
`EventBus.emit('ui-sfx', 'perfect');
    // Spool animation
    const spoolString = this.add.line(0, 0, cx, cy, this.cameras.main.width - 130, this.cameras.main.height - 90, flower.color, 1).setOrigin(0).setDepth(200);
    this.tweens.add({
      targets: spoolString,
      alpha: 0,
      duration: 1000,
      onComplete: () => spoolString.destroy()
    });`);

flower = flower.replace('// === SIMULATE FALLING SAND (every other frame for performance) ===',
`// === SIMULATE FALLING SAND (every other frame for performance) ===
    let simFrames = Math.floor(this.elapsed * 60);
    let escalateThreshold = Math.max(1, 2 - Math.floor(this.elapsed / 20)); // Starts at 2, goes to 1 then 0 (every frame)
    if (simFrames % escalateThreshold === 0)`);
    
flower = flower.replace('// Camera',
`// Florist NPC
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

    // Camera`);
flower = flower.replace('export class FlowerFestivalScene extends Phaser.Scene {',
`export class FlowerFestivalScene extends Phaser.Scene {
  private npcText!: Phaser.GameObjects.Text;`);

fs.writeFileSync('src/game/scenes/FlowerFestivalScene.ts', flower);
console.log('Update complete.');
