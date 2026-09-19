import Phaser from 'phaser';
import { CityMap, NPC_SPAWNS, STAGE_LOCATIONS } from './CityMap';

/**
 * NPCBarkSystem — In-world speech bubble interactions
 *
 * NPCs display context-sensitive "barks" (short speech bubbles)
 * when Mooshak walks nearby. Inspired by A Short Hike, Animal Crossing.
 *
 * 4 bark states:
 *   1. PLEA    — before the obstacle is cleared ("Help us!")
 *   2. CHEER   — during a minigame ("Go Mooshak!")
 *   3. THANKS  — after cleared ("Ganpati Bappa Morya!")
 *   4. GOSSIP  — idle exploration ("Did you see the murti?")
 *
 * Also plays Animalese-style procedural chirp sounds.
 */

export interface NPCData {
  sprite: Phaser.GameObjects.Container;
  npcId: string;
  name: string;
  portrait: string;
  worldX: number;
  worldY: number;
  bubble?: Phaser.GameObjects.Container;
  bubbleTimer?: Phaser.Time.TimerEvent;
  lastBark: number;
  cooldown: number;
  voicePitch: number; // Hz for chirp
}

// Bark dialogue tables
const PLEA_BARKS: Record<string, string[]> = {
  aaji_meera: ['Arre Mooshak! The road is blocked!', 'Quick paws! The rath can\'t pass!', 'Little hero, we need you!'],
  madhav: ['My trays are empty!', 'The sweets will spoil in the rain!', 'Catch them before they hit the dirt!'],
  sakhi_tara: ['The garlands are incomplete!', 'The bamboo arch is bare!', 'We need more flowers, Mooshak!'],
  rohan: ['My drummers lost the beat!', 'The pathak needs a leader!', 'Jump in, Mooshak!'],
  kaka_deepak: ['The crossing is flooded!', 'We can\'t get the rath through!', 'The latches need securing!'],
  anaya: ['The courtyard is dark!', 'The diyas won\'t light themselves!', 'Route the light, Mooshak!'],
};

const CHEER_BARKS = [
  'Shabash!', 'Go go go!', 'Mooshak zindabad!',
  'Almost there!', 'Bappa is watching!', 'You can do it!',
];

const THANKS_BARKS = [
  'Ganpati Bappa Morya!', 'Jai Ganesh!',
  'The procession moves!', 'Modak for everyone!',
  'Look how the street shines!', 'Bappa is pleased!',
];

const GOSSIP_BARKS = [
  'Did you see the murti this year? Magnificent!',
  'I hope the laddu has extra cardamom!',
  'The monsoon clouds look heavy...',
  'My grandmother made the best modak!',
  'Ganpati Bappa Morya! Mangal Murti Morya!',
  'The dhol sounds so powerful today!',
  'Look at the marigold garlands!',
  'Mooshak! You\'re our little hero!',
  'The children are so excited for the procession!',
  'I can smell the ghee from here!',
  'This year\'s celebration is the grandest!',
  'Have you seen the rangoli at the ghat?',
];

// Voice pitch ranges for Animalese chirps
const VOICE_PITCHES: Record<string, number> = {
  aaji_meera: 400,
  madhav: 300,
  sakhi_tara: 500,
  rohan: 250,
  kaka_deepak: 280,
  anaya: 550,
  devotee_1: 350,
  devotee_2: 600, // child — higher pitch
  vendor_1: 450,
  devotee_3: 220,
  devotee_4: 380,
  vendor_2: 320,
};

export class NPCBarkSystem {
  private scene: Phaser.Scene;
  private npcs: NPCData[] = [];
  private clearedStages: boolean[] = Array(6).fill(false);
  private inChallenge = false;
  private audioCtx?: AudioContext;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Initialize NPCs from spawn data */
  init(cityMap: CityMap) {
    // Try to get or create AudioContext for chirps
    try {
      this.audioCtx = new AudioContext();
    } catch {
      // Audio not available
    }

    for (const spawn of NPC_SPAWNS) {
      const { x: worldX, y: worldY } = CityMap.toScreen(spawn.gx, spawn.gy);

      // Create NPC container
      const container = this.scene.add.container(worldX, worldY);

      // NPC shadow
      const shadow = this.scene.add.ellipse(0, 4, 28, 12, 0x000000, 0.35);
      container.add(shadow);

      // NPC Sprite texture
      let texKey = 'devotee';
      if (spawn.npcId === 'sakhi_tara' || spawn.npcId === 'anaya' || spawn.npcId === 'devotee_2') {
        texKey = 'devotee_dancer';
      } else if (spawn.npcId === 'kaka_deepak' || spawn.npcId === 'rohan' || spawn.npcId === 'devotee_3') {
        texKey = 'devotee_flag';
      }

      let character: Phaser.GameObjects.GameObject;
      if (this.scene.textures.exists(texKey)) {
        const sprite = this.scene.add.sprite(0, 0, texKey)
          .setScale(texKey === 'devotee' ? 0.082 : 0.062)
          .setOrigin(0.5, 0.92);
        container.add(sprite);
        character = sprite;
      } else {
        const body = this.scene.add.circle(0, -5, 10, this.getNPCColor(spawn.npcId));
        const head = this.scene.add.circle(0, -18, 7, this.getNPCColor(spawn.npcId) + 0x222222);
        container.add([body, head]);
        character = body;
      }

      // Floating portrait emoji badge
      const portraitBadge = this.scene.add.text(0, -44, spawn.portrait, {
        fontSize: '14px',
      }).setOrigin(0.5);
      container.add(portraitBadge);

      // NPC name tag with festival styling
      const tag = this.scene.add.text(0, -30, spawn.name, {
        fontSize: '9px',
        color: '#ffe294',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#071020',
        strokeThickness: 3,
      }).setOrigin(0.5);
      container.add(tag);

      container.setDepth(worldY + 50);

      // Idle animation — festive sway
      this.scene.tweens.add({
        targets: character,
        y: '-=3',
        duration: 1100 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.scene.tweens.add({
        targets: portraitBadge,
        y: '-=4',
        duration: 1300 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      const npcData: NPCData = {
        sprite: container,
        npcId: spawn.npcId,
        name: spawn.name,
        portrait: spawn.portrait,
        worldX,
        worldY,
        lastBark: 0,
        cooldown: 4000 + Math.random() * 2000,
        voicePitch: VOICE_PITCHES[spawn.npcId] || 400,
      };

      this.npcs.push(npcData);
    }
  }

  /** Update — check proximity to Mooshak and trigger barks */
  update(mooshakX: number, mooshakY: number, time: number) {
    const BARK_RANGE = 100; // pixels

    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(mooshakX, mooshakY, npc.worldX, npc.worldY);

      if (dist < BARK_RANGE && time - npc.lastBark > npc.cooldown) {
        npc.lastBark = time;
        const bark = this.pickBark(npc);
        this.showBubble(npc, bark);
        this.playChirp(npc.voicePitch, bark.length);
      }

      // Update depth for proper sorting
      npc.sprite.setDepth(npc.worldY + 50);
    }
  }

  /** Pick a context-appropriate bark */
  private pickBark(npc: NPCData): string {
    if (this.inChallenge) {
      return Phaser.Utils.Array.GetRandom(CHEER_BARKS);
    }

    // Check if this NPC is a stage NPC and if their stage is cleared
    const stageIndex = this.getStageIndex(npc.npcId);
    if (stageIndex >= 0) {
      if (this.clearedStages[stageIndex]) {
        return Phaser.Utils.Array.GetRandom(THANKS_BARKS);
      } else {
        const pleas = PLEA_BARKS[npc.npcId];
        if (pleas) return Phaser.Utils.Array.GetRandom(pleas);
      }
    }

    // Ambient NPCs — gossip
    return Phaser.Utils.Array.GetRandom(GOSSIP_BARKS);
  }

  /** Show a speech bubble above the NPC */
  private showBubble(npc: NPCData, text: string) {
    // Remove existing bubble
    if (npc.bubble) {
      npc.bubble.destroy();
      npc.bubbleTimer?.destroy();
    }

    const container = this.scene.add.container(npc.worldX, npc.worldY - 45);

    // Bubble background
    const padding = 8;
    const maxWidth = 140;
    const textObj = this.scene.add.text(0, 0, text, {
      fontSize: '10px',
      color: '#1a1a2e',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      wordWrap: { width: maxWidth },
      align: 'center',
    }).setOrigin(0.5);

    const bubbleW = Math.min(maxWidth, textObj.width) + padding * 2;
    const bubbleH = textObj.height + padding * 2;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 6);
    // Bubble tail
    bg.fillTriangle(-4, bubbleH / 2, 4, bubbleH / 2, 0, bubbleH / 2 + 8);
    // Border
    bg.lineStyle(1.5, 0xffa830, 0.8);
    bg.strokeRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 6);

    container.add(bg);
    container.add(textObj);
    container.setDepth(npc.worldY + 200);

    // Animate in
    container.setScale(0.3);
    container.setAlpha(0);
    this.scene.tweens.add({
      targets: container,
      scaleX: 1, scaleY: 1, alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });

    npc.bubble = container;

    // Auto-dismiss after 2.5-3.5 seconds
    const duration = 2500 + text.length * 30;
    npc.bubbleTimer = this.scene.time.delayedCall(duration, () => {
      if (container.active) {
        this.scene.tweens.add({
          targets: container,
          alpha: 0, y: container.y - 10,
          duration: 300,
          onComplete: () => container.destroy(),
        });
      }
      npc.bubble = undefined;
    });
  }

  /** Play Animalese-style chirp sound */
  private playChirp(basePitch: number, textLength: number) {
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const syllables = Math.min(textLength / 3, 12);

    for (let i = 0; i < syllables; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Randomize pitch slightly for each syllable
      const pitch = basePitch + (Math.random() - 0.5) * 80;
      osc.frequency.setValueAtTime(pitch, now + i * 0.055);
      osc.type = 'sine';

      // Short envelope
      const start = now + i * 0.055;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.01);
      gain.gain.linearRampToValueAtTime(0, start + 0.045);

      osc.start(start);
      osc.stop(start + 0.05);
    }
  }

  /** Notify that a stage has been cleared */
  setClearedStage(index: number) {
    if (index >= 0 && index < 6) {
      this.clearedStages[index] = true;
    }
  }

  /** Set challenge active state */
  setChallengeActive(active: boolean) {
    this.inChallenge = active;
  }

  /** Get stage index from NPC id */
  private getStageIndex(npcId: string): number {
    const stageNpcs = ['aaji_meera', 'madhav', 'sakhi_tara', 'rohan', 'kaka_deepak', 'anaya'];
    return stageNpcs.indexOf(npcId);
  }

  /** Get NPC color based on role */
  private getNPCColor(npcId: string): number {
    const colors: Record<string, number> = {
      aaji_meera: 0xcc7744,
      madhav: 0xddaa44,
      sakhi_tara: 0xee6688,
      rohan: 0x44aacc,
      kaka_deepak: 0x886644,
      anaya: 0xaa55cc,
      devotee_1: 0xff8844,
      devotee_2: 0x66bb66,
      vendor_1: 0xee88aa,
      devotee_3: 0xcc6633,
      devotee_4: 0xaa7755,
      vendor_2: 0x997744,
    };
    return colors[npcId] || 0x888888;
  }

  /** Cleanup */
  destroy() {
    for (const npc of this.npcs) {
      npc.bubble?.destroy();
      npc.bubbleTimer?.destroy();
      npc.sprite.destroy();
    }
    this.npcs = [];
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = undefined;
    }
  }
}
