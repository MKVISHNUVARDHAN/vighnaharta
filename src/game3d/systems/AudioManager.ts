import { Howl, Howler } from 'howler';
import { useGameStore } from '@/stores/gameStore';

export class AudioManager {
  private static instance: AudioManager;

  // Music
  private bgMusic: Howl | null = null;
  private bgTabla: Howl | null = null;
  private crowdAmbience: Howl | null = null;

  // SFX pools
  private footstepPool: Howl[] = [];
  private bellSounds: Howl[] = [];
  
  // Additional SFX (optional, based on assets)
  private jumpSound: Howl | null = null;
  private landSounds: Record<string, Howl> = {};
  private tailWhipSound: Howl | null = null;
  private tailAttachSound: Howl | null = null;

  // State
  private musicVolume = 0.7;
  private sfxVolume = 0.8;
  private isMuted = false;
  private initialized = false;

  private constructor() {
    // Listen to store changes for audio settings
    useGameStore.subscribe((state, prevState) => {
      // Check if state is available (Zustand might not pass prevState initially in some versions)
      const prevSettings = prevState ? prevState.settings : null;
      if (prevSettings) {
        if (state.settings.muted !== prevSettings.muted) {
          this.setMuted(state.settings.muted);
        }
        if (state.settings.musicVolume !== prevSettings.musicVolume) {
          this.setMusicVolume(state.settings.musicVolume);
        }
        if (state.settings.sfxVolume !== prevSettings.sfxVolume) {
          this.setSfxVolume(state.settings.sfxVolume);
        }
      } else {
         // Fallback if no prevState
         this.setMuted(state.settings.muted);
         this.setMusicVolume(state.settings.musicVolume);
         this.setSfxVolume(state.settings.sfxVolume);
      }
    });
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public init(): void {
    if (this.initialized) return;

    // Synchronize initial settings
    const settings = useGameStore.getState().settings;
    this.musicVolume = settings.musicVolume;
    this.sfxVolume = settings.sfxVolume;
    this.isMuted = settings.muted;
    Howler.mute(this.isMuted);

    // Music & Ambience
    this.bgMusic = new Howl({
      src: ['/assets/audio/festival/india-rhythm.mp3'],
      loop: true,
      volume: this.musicVolume,
    });

    this.bgTabla = new Howl({
      src: ['/assets/audio/festival/tabla-tune.mp3'],
      loop: true,
      volume: 0, // Starts at 0, fades in maybe based on flow
    });

    this.crowdAmbience = new Howl({
      src: ['/assets/audio/festival/crowd-shouting.ogg'],
      loop: true,
      volume: 0, // Volume based on distance
    });

    // SFX Pools
    // Bell sounds
    this.bellSounds = [
      new Howl({ src: ['/assets/audio/festival/correct-bell.wav'], volume: this.sfxVolume }),
      new Howl({ src: ['/assets/audio/festival/pleasing-bell.wav'], volume: this.sfxVolume }),
    ];

    // Footsteps pool
    const footstepFiles = [
      '/assets/festival/audio/footstep_wood_000.ogg',
      '/assets/festival/audio/footstep_wood_001.ogg',
      '/assets/festival/audio/footstep_wood_002.ogg',
      '/assets/kenney/rpg-audio/Audio/footstep00.ogg',
      '/assets/kenney/rpg-audio/Audio/footstep01.ogg',
    ];
    this.footstepPool = footstepFiles.map(src => new Howl({ src: [src], volume: this.sfxVolume * 0.5 }));

    // Land sounds
    this.landSounds = {
      perfect: new Howl({ src: ['/assets/audio/festival/pleasing-bell.wav'], volume: this.sfxVolume }),
      good: new Howl({ src: ['/assets/kenney/impacts/Audio/footstep_wood_004.ogg'], volume: this.sfxVolume }),
      bad: new Howl({ src: ['/assets/kenney/impacts/Audio/footstep_concrete_004.ogg'], volume: this.sfxVolume }),
    };

    // Generic jump sound (using one of the impacts as placeholder)
    this.jumpSound = new Howl({
      src: ['/assets/kenney/impacts/Audio/footstep_wood_000.ogg'],
      volume: this.sfxVolume * 0.6,
    });

    // Tail sounds
    this.tailWhipSound = new Howl({
      src: ['/assets/kenney/impacts/Audio/footstep_wood_002.ogg'],
      volume: this.sfxVolume,
    });
    this.tailAttachSound = new Howl({
      src: ['/assets/audio/festival/correct-bell.wav'],
      volume: this.sfxVolume,
    });

    // Auto-resume AudioContext on first user interaction (browser autoplay policy)
    const resumeAudioContext = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
      document.removeEventListener('click', resumeAudioContext);
      document.removeEventListener('keydown', resumeAudioContext);
    };
    document.addEventListener('click', resumeAudioContext);
    document.addEventListener('keydown', resumeAudioContext);

    this.initialized = true;
  }

  public destroy(): void {
    Howler.unload();
    this.initialized = false;
  }

  // ── Music ──
  public startMusic(): void {
    if (!this.initialized) return;
    if (this.bgMusic && !this.bgMusic.playing()) {
      this.bgMusic.play();
    }
    if (this.bgTabla && !this.bgTabla.playing()) {
      this.bgTabla.play();
    }
    if (this.crowdAmbience && !this.crowdAmbience.playing()) {
      this.crowdAmbience.play();
    }
  }

  public stopMusic(): void {
    if (!this.initialized) return;
    this.bgMusic?.stop();
    this.bgTabla?.stop();
    this.crowdAmbience?.stop();
  }

  public setCrowdDistance(distance: number): void {
    if (!this.crowdAmbience || !this.initialized) return;
    // Map distance (e.g. 0 to 100) to volume (1 to 0)
    // Adjust scale according to actual game distance metrics
    const maxDistance = 100;
    const normalized = Math.max(0, Math.min(1, 1 - (distance / maxDistance)));
    // Add a base volume plus scaled volume
    const volume = (0.1 + normalized * 0.9) * this.musicVolume;
    this.crowdAmbience.volume(volume);
  }

  // ── SFX ──
  private playRandomizedSfx(howl: Howl | null | undefined, baseVolume: number = 1.0) {
    if (!howl || !this.initialized) return;
    const id = howl.play();
    howl.volume(this.sfxVolume * baseVolume, id);
    // Randomize pitch ±7%
    const rate = 0.93 + Math.random() * 0.14;
    howl.rate(rate, id);
  }

  public playFootstep(): void {
    if (this.footstepPool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * this.footstepPool.length);
    this.playRandomizedSfx(this.footstepPool[randomIndex], 0.5);
  }

  public playJump(): void {
    this.playRandomizedSfx(this.jumpSound);
  }

  public playLand(quality: 'perfect' | 'good' | 'bad'): void {
    this.playRandomizedSfx(this.landSounds[quality]);
  }

  public playBell(): void {
    if (this.bellSounds.length === 0) return;
    const randomIndex = Math.floor(Math.random() * this.bellSounds.length);
    this.playRandomizedSfx(this.bellSounds[randomIndex]);
  }

  public playTailWhip(): void {
    this.playRandomizedSfx(this.tailWhipSound);
  }

  public playTailAttach(): void {
    this.playRandomizedSfx(this.tailAttachSound);
  }

  // ── Settings ──
  public setMusicVolume(vol: number): void {
    this.musicVolume = vol;
    if (this.bgMusic) this.bgMusic.volume(vol);
    if (this.bgTabla) this.bgTabla.volume(vol * 0.5); // Example ratio
    // Crowd volume is dynamically updated, but we could clamp it here
  }

  public setSfxVolume(vol: number): void {
    this.sfxVolume = vol;
    // SFX volumes are typically set on play, but we update the pools if needed
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    Howler.mute(muted);
  }
}
