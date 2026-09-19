export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private muted: boolean = false;
  private masterVolume: number = 0.8;
  private sharedNoiseBuffer: AudioBuffer | null = null;
  private festivalTimer: number | null = null;
  private festivalBeat = 0;

  constructor(_scene?: Phaser.Scene) {}

  init(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioContext = new AudioContextClass();
    } catch {
      console.warn("Web Audio API not supported");
    }

    // Autoplay unlock across browser policies
    const unlock = () => {
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("click", unlock, { passive: true });
    document.addEventListener("touchstart", unlock, { passive: true });
    document.addEventListener("keydown", unlock, { passive: true });
  }

  /** Original procedural festival accompaniment: tanpura-like drone, manjira and gentle dhol. */
  startFestivalMusic(): void {
    if (this.festivalTimer !== null || !this.audioContext || this.muted) return;
    this.playFestivalBeat();
    this.festivalTimer = window.setInterval(() => this.playFestivalBeat(), 310);
  }

  stopFestivalMusic(): void {
    if (this.festivalTimer === null) return;
    window.clearInterval(this.festivalTimer);
    this.festivalTimer = null;
  }

  private playFestivalBeat(): void {
    if (
      !this.audioContext ||
      this.audioContext.state !== "running" ||
      this.muted
    )
      return;
    const ctx = this.audioContext,
      now = ctx.currentTime;
    // A 16-step melodic phrase creates continuous devotional movement rather
    // than the isolated one-per-second pulse of a timer.
    const melody = [
      293.66, 329.63, 392, 440, 392, 329.63, 293.66, 246.94, 293.66, 329.63,
      392, 493.88, 440, 392, 329.63, 293.66,
    ];
    const note = ctx.createOscillator(),
      noteGain = ctx.createGain();
    note.type = "triangle";
    note.frequency.value = melody[this.festivalBeat % melody.length];
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(
      0.035 * this.masterVolume,
      now + 0.035,
    );
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    note.connect(noteGain);
    noteGain.connect(ctx.destination);
    note.start(now);
    note.stop(now + 0.58);
    if ([0, 3, 4, 7, 8, 11, 12, 14].includes(this.festivalBeat % 16))
      this.playBhajanDhol();
    if ([2, 6, 10, 15].includes(this.festivalBeat % 16)) {
      const bell = ctx.createOscillator(),
        gain = ctx.createGain();
      bell.type = "sine";
      bell.frequency.value = 1320;
      gain.gain.setValueAtTime(0.055 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      bell.connect(gain);
      gain.connect(ctx.destination);
      bell.start(now);
      bell.stop(now + 0.18);
    }
    this.festivalBeat++;
  }

  private playBhajanDhol(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator(),
      gain = this.audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(92, now);
    osc.frequency.exponentialRampToValueAtTime(47, now + 0.16);
    gain.gain.setValueAtTime(0.18 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
  }

  private getNoiseBuffer(): AudioBuffer | null {
    if (!this.audioContext) return null;
    if (!this.sharedNoiseBuffer) {
      const bufferSize = this.audioContext.sampleRate * 1; // 1 second buffer
      const buffer = this.audioContext.createBuffer(
        1,
        bufferSize,
        this.audioContext.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.sharedNoiseBuffer = buffer;
    }
    return this.sharedNoiseBuffer;
  }

  // --- Procedural SFX ---

  playClick(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

    gain.gain.setValueAtTime(0.3 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playWhoosh(): void {
    if (!this.audioContext || this.muted) return;
    const noiseBuffer = this.getNoiseBuffer();
    if (!noiseBuffer) return;

    const now = this.audioContext.currentTime;
    const duration = 0.25;

    const source = this.audioContext.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(3.0, now);
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(250, now + duration);

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(
      0.35 * this.masterVolume,
      now + duration * 0.3,
    );
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);

    source.start(now);
    source.stop(now + duration + 0.01);
  }

  playImpact(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    const duration = 0.35;

    // Sub drop
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + duration);

    oscGain.gain.setValueAtTime(0.7 * this.masterVolume, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(oscGain);
    oscGain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + duration);

    // Noise snap
    const noiseBuffer = this.getNoiseBuffer();
    if (noiseBuffer) {
      const noise = this.audioContext.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.12);

      const noiseGain = this.audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.4 * this.masterVolume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.audioContext.destination);
      noise.start(now);
      noise.stop(now + 0.15);
    }
  }

  playBell(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;

    const frequencies = [880, 1760, 2640];
    frequencies.forEach((freq, idx) => {
      if (!this.audioContext) return;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      const vol = (0.25 / (idx + 1)) * this.masterVolume;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    });
  }

  playDholHit(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(0.6 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playPerfect(): void {
    this.playBell();
    this.playDholHit();
  }

  playGood(): void {
    this.playClick();
  }

  playClutch(): void {
    this.playImpact();
    this.playWhoosh();
  }

  playRangoli(): void {
    this.playBell();
    setTimeout(() => this.playBell(), 120);
    setTimeout(() => this.playBell(), 240);
  }

  playFootstep(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = "sine";
    const freq = 400 + (Math.random() * 100 - 50); // +/- 50Hz around 400Hz
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);
    gain.gain.setValueAtTime(0.08 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playDashStart(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    
    // Noise whoosh
    const noiseBuffer = this.getNoiseBuffer();
    if (noiseBuffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = noiseBuffer;
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(1.5, now);
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
      
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2 * this.masterVolume, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);
      source.start(now);
      source.stop(now + 0.25);
    }
    
    // Sine chirp
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.2);
    oscGain.gain.setValueAtTime(0.1 * this.masterVolume, now);
    oscGain.gain.linearRampToValueAtTime(0.01, now + 0.2);
    osc.connect(oscGain);
    oscGain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playDashEnd(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    
    // Sine drop
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    gain.gain.setValueAtTime(0.4 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.16);
    
    // Noise burst
    const noiseBuffer = this.getNoiseBuffer();
    if (noiseBuffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = noiseBuffer;
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      const noiseGain = this.audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.2 * this.masterVolume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      source.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.audioContext.destination);
      source.start(now);
      source.stop(now + 0.15);
    }
  }

  playPickup(combo: number): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    
    // 2^(1/12) is the twelfth root of 2, semitone ratio
    const semitoneRatio = Math.pow(2, 1 / 12);
    // Base frequency is 440Hz, increased by combo semitones
    const freq = 440 * Math.pow(semitoneRatio, Math.max(0, combo - 1));
    
    // Volume cap
    const baseVol = 0.15 + combo * 0.01;
    const vol = Math.min(baseVol, 0.3) * this.masterVolume;
    
    // Layer sine and triangle
    ["sine", "triangle"].forEach((type, idx) => {
      if (!this.audioContext) return;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = type as OscillatorType;
      osc.frequency.setValueAtTime(freq, now);
      // Triangle is slightly quieter
      const layerVol = idx === 1 ? vol * 0.5 : vol;
      gain.gain.setValueAtTime(layerVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    });
  }

  playComboBreak(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    const freqs = [440, 349]; // Minor interval
    
    freqs.forEach((freq, idx) => {
      if (!this.audioContext) return;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = "sine";
      
      const startTime = now + idx * 0.12; // 80ms note + 40ms gap
      
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2 * this.masterVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.09);
    });
  }

  playLevelComplete(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    
    // Bell cascade
    const bellFreqs = [880, 1100, 1320];
    bellFreqs.forEach((freq, idx) => {
      if (!this.audioContext) return;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = "sine";
      const startTime = now + idx * 0.1;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15 * this.masterVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.9);
    });
    
    // Dhol roll
    for (let i = 0; i < 4; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = "triangle";
      const startTime = now + i * 0.05;
      osc.frequency.setValueAtTime(110, startTime);
      osc.frequency.exponentialRampToValueAtTime(45, startTime + 0.1);
      gain.gain.setValueAtTime(0.3 * this.masterVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.15);
    }
    
    // Rising shimmer
    const noiseBuffer = this.getNoiseBuffer();
    if (noiseBuffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = noiseBuffer;
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "bandpass";
      filter.Q.setValueAtTime(3.0, now);
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(8000, now + 0.5);
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.15 * this.masterVolume, now + 0.25);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);
      source.start(now);
      source.stop(now + 0.65);
    }
    
    // Final sustain (C5, E5, G5)
    const chordFreqs = [523.25, 659.25, 783.99]; // C5, E5, G5
    const chordStart = now + 0.4;
    chordFreqs.forEach((freq) => {
      if (!this.audioContext) return;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, chordStart);
      gain.gain.setValueAtTime(0.01, chordStart);
      gain.gain.linearRampToValueAtTime(0.15 * this.masterVolume, chordStart + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.6);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(chordStart);
      osc.stop(chordStart + 0.7);
    });
  }

  playStageClear(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    
    // D5, F#5, A5, D6
    const freqs = [587.33, 739.99, 880, 1174.66];
    freqs.forEach((freq, idx) => {
      if (!this.audioContext) return;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = "triangle"; // for warmth
      
      const startTime = now + idx * 0.1; // slight overlap since each is 120ms long
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.2 * this.masterVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  }

  playHurt(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    
    // Descending sine
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
    gain.gain.setValueAtTime(0.15 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.12);
    
    // Filtered noise
    const noiseBuffer = this.getNoiseBuffer();
    if (noiseBuffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = noiseBuffer;
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, now);
      const noiseGain = this.audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.15 * this.masterVolume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      source.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.audioContext.destination);
      source.start(now);
      source.stop(now + 0.12);
    }
  }

  playMenuHover(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.05 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.02);
  }

  playMenuSelect(): void {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    
    [800, 1600].forEach((freq) => {
      if (!this.audioContext) return;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      // Main tone gets full volume, harmonic gets half
      const vol = (freq === 800 ? 0.12 : 0.06) * this.masterVolume;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    });
  }

  update(_time: number, _delta: number): void {}

  destroy(): void {
    this.stopFestivalMusic();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
