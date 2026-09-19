import { RhythmRating } from '@/types/game';

export class RhythmSystem {
  private scene: Phaser.Scene;
  private audioContext: AudioContext | null = null;
  private bpm: number = 100;
  private nextBeatTime: number = 0;
  private beatPhase: number = 0;
  private schedulerTimer: number | null = null;
  private beatQueue: { time: number, handled: boolean }[] = [];
  
  private readonly PERFECT_WINDOW_MS = 95;
  private readonly GOOD_WINDOW_MS = 190;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(): void {
    this.schedulerTimer = window.setInterval(() => this.scheduleBeats(), 25);
  }
  
  setAudioContext(ctx: AudioContext | null): void {
    this.audioContext = ctx;
    if (this.audioContext) {
      this.nextBeatTime = this.audioContext.currentTime + 0.1;
    }
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
  }

  private scheduleBeats(): void {
    const time = this.getCurrentTime();
    const secondsPerBeat = 60.0 / this.bpm;
    
    while (this.nextBeatTime < time + 0.1) {
      this.beatQueue.push({ time: this.nextBeatTime, handled: false });
      this.nextBeatTime += secondsPerBeat;
    }
  }
  
  private getCurrentTime(): number {
    return this.audioContext ? this.audioContext.currentTime : performance.now() / 1000;
  }

  checkInputTiming(): RhythmRating {
    const now = this.getCurrentTime();
    let closestBeatDiff = Infinity;

    for (const beat of this.beatQueue) {
      const diff = Math.abs(beat.time - now);
      if (diff < closestBeatDiff) {
        closestBeatDiff = diff;
      }
    }
    
    const diffMs = closestBeatDiff * 1000;
    if (diffMs <= this.PERFECT_WINDOW_MS) return 'PERFECT';
    if (diffMs <= this.GOOD_WINDOW_MS) return 'GOOD';
    return 'NORMAL';
  }

  getCurrentBeatPhase(): number {
    return this.beatPhase;
  }

  update(time: number, delta: number): void {
    const now = this.getCurrentTime();
    
    if (this.beatQueue.length > 0) {
      const nextBeat = this.beatQueue[0];
      const secondsPerBeat = 60.0 / this.bpm;
      const timeSinceLastBeat = now - (nextBeat.time - secondsPerBeat);
      this.beatPhase = Math.max(0, Math.min(1, timeSinceLastBeat / secondsPerBeat));

      if (now >= nextBeat.time) {
        if (!nextBeat.handled) {
          nextBeat.handled = true;
          // Trigger visual beat event
        }
        if (now > nextBeat.time + 0.1) {
          this.beatQueue.shift();
        }
      }
    }
  }

  destroy(): void {
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
    }
  }
}
