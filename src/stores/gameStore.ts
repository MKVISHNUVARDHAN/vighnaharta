import { create } from 'zustand';
import type {
  GamePhase, ActName, Grade, PersonalBest,
  GameSettings, RunStats, SevaFlowState, ProcessionState, InputState,
} from '@/types/game';

// ── Flow multiplier tiers ──
const FLOW_TIERS = [1, 2, 4, 6, 8, 12] as const;

// ── Grade thresholds ──
function calculateGrade(score: number): Grade {
  if (score >= 50000) return 'DIAMOND';
  if (score >= 35000) return 'GOLD';
  if (score >= 20000) return 'SILVER';
  return 'BRONZE';
}

// ── Store Interface ──
interface GameState {
  // Phase
  gamePhase: GamePhase;
  currentAct: ActName;

  // Score
  sevaScore: number;
  highScore: number;

  // Seva Flow
  flow: SevaFlowState;

  // Procession
  procession: ProcessionState;

  // Run stats (accumulated during play)
  perfectLandings: number;
  tailSaves: number;
  secretRoutesFound: number;
  physicsChains: number;
  timeElapsed: number;

  // Settings
  settings: GameSettings;
  personalBest: PersonalBest;
  isPaused: boolean;

  // Input (updated every frame from InputManager)
  input: InputState;

  // Actions
  setGamePhase: (phase: GamePhase) => void;
  setAct: (act: ActName) => void;
  addScore: (points: number) => void;
  updateFlow: (flow: Partial<SevaFlowState>) => void;
  advanceFlowTier: () => void;
  resetFlow: () => void;
  updateProcession: (p: Partial<ProcessionState>) => void;
  loseBell: () => void;
  incrementStat: (stat: 'perfectLandings' | 'tailSaves' | 'secretRoutesFound' | 'physicsChains') => void;
  setTimeElapsed: (t: number) => void;
  setInput: (input: InputState) => void;
  updateSettings: (s: Partial<GameSettings>) => void;
  togglePause: () => void;
  resetRun: () => void;
  finishRun: () => RunStats;
}

// ── Persistence ──
const loadSettings = (): GameSettings => {
  try {
    const saved = localStorage.getItem('vighnaharta_settings_v2');
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
  } catch { /* noop */ }
  return defaultSettings;
};

const loadPersonalBest = (): PersonalBest => {
  try {
    const saved = localStorage.getItem('vighnaharta_pb_v2');
    if (saved) return JSON.parse(saved);
  } catch { /* noop */ }
  return defaultPersonalBest;
};

const defaultSettings: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
  reducedMotion: false,
  sensitivity: 1.0,
};

const defaultPersonalBest: PersonalBest = {
  sevaScore: 0,
  time: 0,
  maxFlow: 1,
  perfectLandings: 0,
  grade: 'BRONZE',
};

const defaultFlow: SevaFlowState = {
  multiplier: 1,
  progress: 0,
  isSurge: false,
  surgeTimeRemaining: 0,
  chainCount: 0,
  lastActionTime: 0,
};

const defaultProcession: ProcessionState = {
  distance: 60,
  bellsRemaining: 3,
  intensityLevel: 0,
  isPaused: false,
};

const defaultInput: InputState = {
  moveX: 0,
  moveZ: 0,
  jump: false,
  jumpJustPressed: false,
  tail: false,
  tailJustPressed: false,
  tailJustReleased: false,
  lookDeltaX: 0,
  lookDeltaY: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  gamePhase: 'MENU',
  currentAct: 'BAZAAR',
  sevaScore: 0,
  highScore: loadPersonalBest().sevaScore,
  flow: { ...defaultFlow },
  procession: { ...defaultProcession },
  perfectLandings: 0,
  tailSaves: 0,
  secretRoutesFound: 0,
  physicsChains: 0,
  timeElapsed: 0,
  settings: loadSettings(),
  personalBest: loadPersonalBest(),
  isPaused: false,
  input: { ...defaultInput },

  setGamePhase: (gamePhase) => set({ gamePhase }),
  setAct: (currentAct) => set({ currentAct }),

  addScore: (points) => set((s) => {
    const multiplied = Math.round(points * s.flow.multiplier);
    return { sevaScore: s.sevaScore + multiplied };
  }),

  updateFlow: (partial) => set((s) => ({
    flow: { ...s.flow, ...partial },
  })),

  advanceFlowTier: () => set((s) => {
    const currentIdx = FLOW_TIERS.indexOf(s.flow.multiplier as any);
    const nextIdx = Math.min(currentIdx + 1, FLOW_TIERS.length - 1);
    const nextMultiplier = FLOW_TIERS[nextIdx];
    const isSurge = nextIdx === FLOW_TIERS.length - 1;
    return {
      flow: {
        ...s.flow,
        multiplier: nextMultiplier,
        progress: 0,
        isSurge,
        surgeTimeRemaining: isSurge ? 8 : 0,
        chainCount: s.flow.chainCount + 1,
      },
    };
  }),

  resetFlow: () => set({ flow: { ...defaultFlow, lastActionTime: performance.now() } }),

  updateProcession: (partial) => set((s) => ({
    procession: { ...s.procession, ...partial },
  })),

  loseBell: () => set((s) => ({
    procession: {
      ...s.procession,
      bellsRemaining: Math.max(0, s.procession.bellsRemaining - 1),
    },
  })),

  incrementStat: (stat) => set((s) => ({
    [stat]: (s[stat] as number) + 1,
  })),

  setTimeElapsed: (timeElapsed) => set({ timeElapsed }),
  setInput: (input) => set({ input }),

  updateSettings: (newSettings) => set((s) => {
    const settings = { ...s.settings, ...newSettings };
    try {
      localStorage.setItem('vighnaharta_settings_v2', JSON.stringify(settings));
    } catch { /* storage is optional */ }
    return { settings };
  }),

  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

  resetRun: () => set({
    sevaScore: 0,
    currentAct: 'BAZAAR',
    flow: { ...defaultFlow },
    procession: { ...defaultProcession },
    perfectLandings: 0,
    tailSaves: 0,
    secretRoutesFound: 0,
    physicsChains: 0,
    timeElapsed: 0,
    isPaused: false,
  }),

  finishRun: () => {
    const s = get();
    const grade = calculateGrade(s.sevaScore);
    const isNewBest = s.sevaScore > s.personalBest.sevaScore;

    const stats: RunStats = {
      sevaScore: s.sevaScore,
      processionStops: 3 - s.procession.bellsRemaining,
      maxFlow: s.flow.multiplier,
      perfectLandings: s.perfectLandings,
      tailSaves: s.tailSaves,
      secretRoutes: s.secretRoutesFound,
      totalSecretRoutes: 6,
      physicsChains: s.physicsChains,
      timeElapsed: s.timeElapsed,
      grade,
      isNewBest,
    };

    if (isNewBest) {
      const newPb: PersonalBest = {
        sevaScore: s.sevaScore,
        time: s.timeElapsed,
        maxFlow: s.flow.multiplier,
        perfectLandings: s.perfectLandings,
        grade,
      };
      try {
        localStorage.setItem('vighnaharta_pb_v2', JSON.stringify(newPb));
      } catch { /* noop */ }
      set({ personalBest: newPb, highScore: newPb.sevaScore });
    }

    return stats;
  },
}));
