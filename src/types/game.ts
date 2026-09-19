// ── Core Game Types for Vighnaharta: Path of Light ──
// 3D arcade game — Mooshak with Tail Tether mechanic

import type * as THREE from 'three';

// ── Game Phases ──
export type GamePhase = 'LOADING' | 'MENU' | 'PLAYING' | 'RESULTS' | 'FAILED';

// ── Act Progression ──
export type ActName = 'BAZAAR' | 'MONSOON' | 'GHAT';

// ── Scoring ──
export type Grade = 'DIAMOND' | 'GOLD' | 'SILVER' | 'BRONZE';

// ── Landing Quality ──
export type LandingQuality = 'PERFECT' | 'GOOD' | 'BAD';

// ── Tail Target Types ──
export type TailTargetType =
  | 'FIXED_HIGH'    // garland, banner, bell rope — swing point
  | 'LIGHT_OBJECT'  // basket, bucket, box — grab/yank/throw
  | 'HEAVY_MOVABLE' // cart, trolley — pull/redirect
  | 'MOVING_OBJECT' // rolling cart — attach and surf
  | 'LEVER'         // rope, switch — yank while passing
  | 'LEDGE';        // edge — auto-catch on near-miss

// ── Interactive Object Hierarchy ──
export type InteractivityLevel = 'HERO' | 'SIMPLE' | 'DECORATIVE';

// ── Physics Collision Groups ──
export const COLLISION_GROUPS = {
  PLAYER: 0x0001,
  INTERACTIVE: 0x0002,
  STATIC: 0x0004,
  DECORATIVE: 0x0008,
  TAIL: 0x0010,
  TRIGGER: 0x0020,
  PROCESSION: 0x0040,
} as const;

// ── Tail Target Info ──
export interface TailTarget {
  id: string;
  type: TailTargetType;
  position: THREE.Vector3;
  /** Score for target priority (higher = better match) */
  score: number;
  /** Whether this target is currently valid */
  active: boolean;
}

// ── Tail State ──
export type TailState =
  | 'IDLE'
  | 'SEEKING'
  | 'ATTACHED_SWING'
  | 'ATTACHED_GRAB'
  | 'ATTACHED_PULL'
  | 'ATTACHED_SURF'
  | 'YANKING'
  | 'LEDGE_CATCH'
  | 'RELEASING';

// ── Movement State ──
export interface MovementState {
  speed: number;
  maxSpeed: number;
  momentum: number;
  isGrounded: boolean;
  isJumping: boolean;
  isFalling: boolean;
  jumpHeld: boolean;
  coyoteTimeRemaining: number;
  jumpBuffered: boolean;
  lastGroundedTime: number;
}

// ── Seva Flow ──
export interface SevaFlowState {
  multiplier: number;      // ×1, ×2, ×4, ×6, ×8, ×12
  progress: number;        // 0-1 toward next tier
  isSurge: boolean;        // Seva Surge active
  surgeTimeRemaining: number;
  chainCount: number;      // consecutive actions
  lastActionTime: number;
}

// ── Procession State ──
export interface ProcessionState {
  distance: number;        // meters between procession and player
  bellsRemaining: number;  // 3, 2, 1, 0
  intensityLevel: number;  // 0-6 (based on distance thresholds)
  isPaused: boolean;       // paused at uncleared gate
}

// ── Personal Best ──
export interface PersonalBest {
  sevaScore: number;
  time: number;
  maxFlow: number;
  perfectLandings: number;
  grade: Grade;
}

// ── Run Statistics ──
export interface RunStats {
  sevaScore: number;
  processionStops: number;
  maxFlow: number;
  perfectLandings: number;
  tailSaves: number;
  secretRoutes: number;
  totalSecretRoutes: number;
  physicsChains: number;
  timeElapsed: number;
  grade: Grade;
  isNewBest: boolean;
}

// ── Game Settings ──
export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  reducedMotion: boolean;
  sensitivity: number;
}

// ── Input Actions ──
export interface InputState {
  moveX: number;         // -1 to 1 (A/D or joystick)
  moveZ: number;         // -1 to 1 (W/S or joystick)
  jump: boolean;         // space or button
  jumpJustPressed: boolean;
  tail: boolean;         // shift/LMB or button
  tailJustPressed: boolean;
  tailJustReleased: boolean;
  lookDeltaX: number;    // mouse delta X
  lookDeltaY: number;    // mouse delta Y
}

// ── Festival Director ──
export interface IntensityState {
  current: number;       // 0-1
  phase: 'CONTROL' | 'CHAOS' | 'RELEASE';
  phaseTime: number;     // seconds in current phase
  playerPerformance: number; // 0-1 rolling average
}

// ── Gate Checkpoint ──
export interface GateCheckpoint {
  id: string;
  position: THREE.Vector3;
  cleared: boolean;
  actBoundary: boolean;
  requiredActions: string[];
}

// ── Vec3 Serializable ──
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// ── Event Types ──
export interface GameEvents {
  'score-changed': (score: number) => void;
  'flow-changed': (multiplier: number) => void;
  'seva-surge-start': () => void;
  'seva-surge-end': () => void;
  'act-changed': (act: ActName) => void;
  'bell-lost': (remaining: number) => void;
  'perfect-landing': () => void;
  'tail-attach': (type: TailTargetType) => void;
  'tail-release': (momentum: number) => void;
  'clutch-save': () => void;
  'chain-reaction': (count: number) => void;
  'secret-route': (id: string) => void;
  'game-over': (stats: RunStats) => void;
  'finale-start': () => void;
  'procession-distance': (meters: number) => void;
  'toast': (message: string, style: 'perfect' | 'warning' | 'info' | 'chain') => void;
}
