import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import type { ChallengeProps } from "./types";
import { formatTime, MiniHud } from "./types";

const LABELS = ["D", "F", "J", "K"];
const NAMES = ["DHOL · DUM", "DHOL RIM · TAK", "TASHA · TIR", "MANJIRA · TING"];
type Note = { id: number; lane: number; beat: number; judged?: "perfect" | "good" | "miss" };

class FestivalAudio {
  ctx: AudioContext | null = null;
  musicTimer = 0;
  musicStep = 0;
  settings = { muted: false, music: 1, sfx: 1 };

  async unlock() {
    this.ctx ??= new AudioContext();
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  strike(lane: number) {
    const ctx = this.ctx;
    if (!ctx || this.settings.muted) return;
    const now = ctx.currentTime;
    if (lane === 3) {
      [1350, 1780, 2250].forEach((frequency, index) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.type = "sine"; osc.frequency.value = frequency;
        gain.gain.setValueAtTime((0.09 / (index + 1)) * this.settings.sfx, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.23);
        osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 0.25);
      });
      return;
    }
    const osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
    osc.type = lane === 2 ? "sawtooth" : lane === 1 ? "square" : "sine";
    const start = [105, 360, 230][lane], end = [48, 130, 95][lane];
    osc.frequency.setValueAtTime(start, now); osc.frequency.exponentialRampToValueAtTime(end, now + 0.16);
    filter.type = "lowpass"; filter.frequency.value = lane === 2 ? 1500 : 850;
    gain.gain.setValueAtTime([0.34, 0.16, 0.2][lane] * this.settings.sfx, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
    osc.connect(filter).connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 0.2);
  }

  startMusic() {
    if (!this.ctx || this.musicTimer || this.settings.muted) return;
    const melody = [293.66, 329.63, 392, 329.63, 440, 392, 329.63, 246.94];
    this.musicTimer = window.setInterval(() => {
      const ctx = this.ctx;
      if (!ctx || ctx.state !== "running" || this.settings.muted) return;
      const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "triangle"; osc.frequency.value = melody[this.musicStep++ % melody.length];
      gain.gain.setValueAtTime(0.0001, now); gain.gain.linearRampToValueAtTime(0.025 * this.settings.music, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 0.45);
    }, 300);
  }

  stop() { if (this.musicTimer) window.clearInterval(this.musicTimer); this.musicTimer = 0; this.ctx?.close(); this.ctx = null; }
}

export default function RhythmGame({ assisted, onWin, onFail }: ChallengeProps) {
  const settings = useGameStore((state) => state.settings);
  const chart = useMemo<Note[]>(() => Array.from({ length: 48 }, (_, id) => ({ id, lane: [0, 1, 0, 2, 1, 3, 0, 1][id % 8], beat: 2.4 + id * 0.6 })), []);
  const [notes, setNotes] = useState(chart);
  const [phase, setPhase] = useState<"test" | "ready" | "play">("test");
  const [tested, setTested] = useState<boolean[]>([false, false, false, false]);
  const [active, setActive] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const [hits, setHits] = useState(0);
  const [perfect, setPerfect] = useState(0);
  const [feedback, setFeedback] = useState("PRESS EACH LETTER TO HEAR ITS INSTRUMENT");
  const audio = useRef(new FestivalAudio());
  const startAt = useRef(0);
  const raf = useRef(0);
  const finished = useRef(false);

  useEffect(() => {
    audio.current.settings = { muted: settings.muted, music: settings.musicVolume, sfx: settings.sfxVolume };
  }, [settings]);

  const begin = useCallback(async () => {
    await audio.current.unlock(); audio.current.startMusic();
    setPhase("ready"); setFeedback("4 · 3 · 2 · 1");
    window.setTimeout(() => { startAt.current = performance.now(); setPhase("play"); setFeedback("PLAY WITH THE BAND"); }, 1600);
  }, []);

  const strike = useCallback(async (lane: number) => {
    await audio.current.unlock(); audio.current.strike(lane);
    setActive(lane); window.setTimeout(() => setActive(-1), 120);
    if (phase === "test") {
      setTested((current) => {
        const next = [...current]; next[lane] = true;
        setFeedback(next.every(Boolean) ? "ALL FOUR READY · START THE MUSIC" : `${NAMES[lane]} · ${next.filter(Boolean).length}/4 READY`);
        return next;
      });
      return;
    }
    if (phase !== "play") return;
    const now = (performance.now() - startAt.current) / 1000;
    const windowSize = assisted ? 0.2 : 0.14;
    let best = -1, bestOffset = Infinity;
    notes.forEach((note, index) => {
      if (note.judged || note.lane !== lane) return;
      const offset = Math.abs(now - note.beat);
      if (offset < bestOffset) { bestOffset = offset; best = index; }
    });
    if (best < 0 || bestOffset > windowSize) { setFeedback("FREE STRIKE · FOLLOW THE APPROACHING NOTE"); return; }
    const judgment = bestOffset <= 0.07 ? "perfect" : "good";
    setNotes((current) => current.map((note, index) => index === best ? { ...note, judged: judgment } : note));
    setHits((value) => value + 1); if (judgment === "perfect") setPerfect((value) => value + 1);
    setFeedback(judgment === "perfect" ? "PERFECT" : now < notes[best].beat ? "GOOD · EARLY" : "GOOD · LATE");
  }, [assisted, notes, phase]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const lane = LABELS.indexOf(event.key.toUpperCase());
      if (lane >= 0) strike(lane);
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [strike]);

  useEffect(() => {
    if (phase !== "play") return;
    const frame = () => {
      const now = (performance.now() - startAt.current) / 1000; setElapsed(now);
      setNotes((current) => current.map((note) => !note.judged && now - note.beat > (assisted ? 0.21 : 0.16) ? { ...note, judged: "miss" } : note));
      if (now < chart[chart.length - 1].beat + 1) raf.current = requestAnimationFrame(frame);
      else if (!finished.current) {
        finished.current = true;
        if (hits >= 29) onWin(assisted ? "ASSISTED" : hits >= 44 && perfect >= 30 ? "GOLD" : hits >= 39 ? "SILVER" : "BRONZE");
        else onFail();
      }
    };
    raf.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf.current);
  }, [assisted, chart, hits, onFail, onWin, perfect, phase]);

  useEffect(() => () => audio.current.stop(), []);

  const ready = tested.every(Boolean);
  return (
    <div className="rhythm-game rhythm-v2">
      <MiniHud left={phase === "test" ? "INSTRUMENT CHECK" : `HITS ${hits}/48 · PERFECT ${perfect}`} right={phase === "play" ? formatTime(Math.max(0, chart[47].beat + 1 - elapsed)) : "D F J K"} />
      {phase === "play" && <div className="note-highway"><div className="strike-line" />{notes.filter((note) => !note.judged && note.beat - elapsed < 2.3).map((note) => <i key={note.id} className={`note lane-${note.lane}`} style={{ top: `${Math.max(-5, 88 - (note.beat - elapsed) * 40)}%` }}>{LABELS[note.lane]}</i>)}</div>}
      <div className="instrument-pads">
        {LABELS.map((label, lane) => <button key={label} className={`${active === lane ? "active" : ""} ${tested[lane] ? "tested" : ""}`} onPointerDown={() => strike(lane)}><kbd>{label}</kbd><span>{NAMES[lane]}</span><i /></button>)}
      </div>
      <p className="rhythm-feedback">{feedback}</p>
      {phase === "test" && <button className="song-start" disabled={!ready} onClick={begin}>{ready ? "START SONG" : "PLAY ALL FOUR LETTERS"}</button>}
    </div>
  );
}
