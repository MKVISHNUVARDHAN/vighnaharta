import type { DifficultyParams, ActName } from '@/types/game';

interface DifficultyBreakpoint {
  time: number;
  params: DifficultyParams;
}

const breakpoints: DifficultyBreakpoint[] = [
  { time: 0, params: { obstacleFrequency: 0.3, obstacleDifficulty: 1, junctionDecisionWindow: 2000, processionSpeed: 1.0, bpm: 100 } },
  { time: 15, params: { obstacleFrequency: 0.5, obstacleDifficulty: 2, junctionDecisionWindow: 1800, processionSpeed: 1.1, bpm: 105 } },
  { time: 35, params: { obstacleFrequency: 0.7, obstacleDifficulty: 3, junctionDecisionWindow: 1600, processionSpeed: 1.2, bpm: 115 } },
  { time: 60, params: { obstacleFrequency: 0.9, obstacleDifficulty: 4, junctionDecisionWindow: 1400, processionSpeed: 1.35, bpm: 120 } },
  { time: 90, params: { obstacleFrequency: 1.0, obstacleDifficulty: 4, junctionDecisionWindow: 1300, processionSpeed: 1.45, bpm: 125 } },
  { time: 120, params: { obstacleFrequency: 1.2, obstacleDifficulty: 5, junctionDecisionWindow: 1200, processionSpeed: 1.6, bpm: 130 } }
];

const actBreakpoints: { time: number; act: ActName }[] = [
  { time: 0, act: 'DUSK' },
  { time: 15, act: 'CITY_AWAKENS' },
  { time: 35, act: 'VIGHNAS' },
  { time: 60, act: 'MONSOON' },
  { time: 90, act: 'FINAL_PUSH' },
  { time: 120, act: 'FINALE' }
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function getDifficultyParams(elapsedSeconds: number): DifficultyParams {
  let lower = breakpoints[0];
  let upper = breakpoints[breakpoints.length - 1];

  for (let i = 0; i < breakpoints.length - 1; i++) {
    if (elapsedSeconds >= breakpoints[i].time && elapsedSeconds < breakpoints[i + 1].time) {
      lower = breakpoints[i];
      upper = breakpoints[i + 1];
      break;
    }
  }

  if (elapsedSeconds >= upper.time) {
    return { ...upper.params };
  }

  const range = upper.time - lower.time;
  const t = range > 0 ? (elapsedSeconds - lower.time) / range : 0;

  return {
    obstacleFrequency: lerp(lower.params.obstacleFrequency, upper.params.obstacleFrequency, t),
    obstacleDifficulty: lerp(lower.params.obstacleDifficulty, upper.params.obstacleDifficulty, t),
    junctionDecisionWindow: lerp(lower.params.junctionDecisionWindow, upper.params.junctionDecisionWindow, t),
    processionSpeed: lerp(lower.params.processionSpeed, upper.params.processionSpeed, t),
    bpm: lerp(lower.params.bpm, upper.params.bpm, t)
  };
}

export function getActForTime(elapsedSeconds: number): ActName {
  let act: ActName = 'DUSK';
  for (const bp of actBreakpoints) {
    if (elapsedSeconds >= bp.time) {
      act = bp.act;
    } else {
      break;
    }
  }
  return act;
}
