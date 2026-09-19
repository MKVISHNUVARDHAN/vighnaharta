import type { DecisionChallenge, JunctionData, LanePosition, ObstacleSlot, ObstacleType, RoadSegment, RouteType, Vec2 } from '@/types/game';

export const START_NODE = 'node_start';
export const END_NODE = 'node_end';

type Stage = {
  id: string;
  position: Vec2;
  next: Vec2;
  beat: number;
  options: Array<{
    direction: 'left' | 'right' | 'forward';
    type: RouteType;
    risk: number;
    bonus: number;
    bend: number;
    obstacles: Array<[number, LanePosition, ObstacleType]>;
  }>;
};

const slot = ([position, lane, type]: [number, LanePosition, ObstacleType], difficulty: number): ObstacleSlot => ({ position, lane, type, difficulty });

// Authored, converging route stages: every choice changes risk and scenery without creating a dead end.
const stages: Stage[] = [
  { id: 'node_pandal', position: { x: 620, y: 720 }, next: { x: 1260, y: 460 }, beat: 4, options: [
    { direction: 'left', type: 'shortcut', risk: 2, bonus: 250, bend: -210, obstacles: [[.42, 0, 'barricade']] },
    { direction: 'forward', type: 'safe', risk: 1, bonus: 100, bend: 0, obstacles: [[.55, 1, 'barricade']] },
    { direction: 'right', type: 'festival', risk: 2, bonus: 200, bend: 210, obstacles: [[.48, -1, 'crowd_surge']] },
  ]},
  { id: 'node_bazaar', position: { x: 1260, y: 460 }, next: { x: 1920, y: 740 }, beat: 8, options: [
    { direction: 'left', type: 'festival', risk: 2, bonus: 220, bend: -210, obstacles: [[.34, 1, 'crowd_surge'], [.7, -1, 'construction']] },
    { direction: 'forward', type: 'safe', risk: 1, bonus: 100, bend: 0, obstacles: [[.55, 0, 'puddle']] },
    { direction: 'right', type: 'shortcut', risk: 3, bonus: 300, bend: 220, obstacles: [[.3, -1, 'construction'], [.66, 1, 'barricade']] },
  ]},
  { id: 'node_tilak', position: { x: 1920, y: 740 }, next: { x: 2580, y: 480 }, beat: 12, options: [
    { direction: 'left', type: 'multiplier', risk: 4, bonus: 350, bend: -230, obstacles: [[.28, 0, 'gate_closing'], [.62, -1, 'crowd_surge']] },
    { direction: 'forward', type: 'safe', risk: 2, bonus: 110, bend: 0, obstacles: [[.42, 1, 'barricade'], [.75, -1, 'puddle']] },
    { direction: 'right', type: 'festival', risk: 3, bonus: 240, bend: 220, obstacles: [[.35, 0, 'construction'], [.7, 1, 'crowd_surge']] },
  ]},
  { id: 'node_market', position: { x: 2580, y: 480 }, next: { x: 3240, y: 760 }, beat: 16, options: [
    { direction: 'left', type: 'shortcut', risk: 4, bonus: 320, bend: -220, obstacles: [[.22, -1, 'barricade'], [.52, 0, 'gate_closing'], [.78, 1, 'construction']] },
    { direction: 'forward', type: 'safe', risk: 2, bonus: 120, bend: 0, obstacles: [[.4, 0, 'crowd_surge'], [.72, -1, 'puddle']] },
    { direction: 'right', type: 'festival', risk: 3, bonus: 250, bend: 230, obstacles: [[.31, 1, 'construction'], [.68, 0, 'barricade']] },
  ]},
  { id: 'node_bridge', position: { x: 3240, y: 760 }, next: { x: 3900, y: 500 }, beat: 20, options: [
    { direction: 'left', type: 'festival', risk: 3, bonus: 260, bend: -220, obstacles: [[.25, 0, 'puddle'], [.58, 1, 'crowd_surge'], [.8, -1, 'puddle']] },
    { direction: 'forward', type: 'safe', risk: 2, bonus: 130, bend: 0, obstacles: [[.42, -1, 'puddle'], [.72, 1, 'barricade']] },
    { direction: 'right', type: 'multiplier', risk: 4, bonus: 380, bend: 220, obstacles: [[.25, 1, 'gate_closing'], [.52, 0, 'puddle'], [.78, -1, 'construction']] },
  ]},
  { id: 'node_monsoon', position: { x: 3900, y: 500 }, next: { x: 4560, y: 780 }, beat: 24, options: [
    { direction: 'left', type: 'shortcut', risk: 5, bonus: 400, bend: -240, obstacles: [[.2, -1, 'puddle'], [.43, 0, 'gate_closing'], [.7, 1, 'puddle']] },
    { direction: 'forward', type: 'safe', risk: 3, bonus: 140, bend: 0, obstacles: [[.3, 0, 'puddle'], [.66, -1, 'crowd_surge']] },
    { direction: 'right', type: 'festival', risk: 4, bonus: 280, bend: 230, obstacles: [[.26, 1, 'construction'], [.5, 0, 'puddle'], [.78, -1, 'barricade']] },
  ]},
  { id: 'node_blackout', position: { x: 4560, y: 780 }, next: { x: 5220, y: 510 }, beat: 28, options: [
    { direction: 'left', type: 'festival', risk: 4, bonus: 300, bend: -220, obstacles: [[.25, 0, 'power_failure'], [.5, -1, 'crowd_surge'], [.76, 1, 'barricade']] },
    { direction: 'forward', type: 'safe', risk: 3, bonus: 150, bend: 0, obstacles: [[.35, 1, 'power_failure'], [.7, -1, 'construction']] },
    { direction: 'right', type: 'multiplier', risk: 5, bonus: 450, bend: 230, obstacles: [[.2, -1, 'gate_closing'], [.45, 0, 'power_failure'], [.72, 1, 'puddle']] },
  ]},
  { id: 'node_oldcity', position: { x: 5220, y: 510 }, next: { x: 5880, y: 790 }, beat: 32, options: [
    { direction: 'left', type: 'shortcut', risk: 5, bonus: 450, bend: -240, obstacles: [[.2, 0, 'construction'], [.44, 1, 'gate_closing'], [.68, -1, 'crowd_surge'], [.84, 0, 'puddle']] },
    { direction: 'forward', type: 'safe', risk: 3, bonus: 160, bend: 0, obstacles: [[.3, -1, 'barricade'], [.58, 0, 'puddle'], [.8, 1, 'crowd_surge']] },
    { direction: 'right', type: 'festival', risk: 4, bonus: 320, bend: 230, obstacles: [[.25, 1, 'puddle'], [.55, 0, 'gate_closing'], [.8, -1, 'construction']] },
  ]},
  { id: 'node_waterfront', position: { x: 5880, y: 790 }, next: { x: 6540, y: 520 }, beat: 36, options: [
    { direction: 'left', type: 'safe', risk: 3, bonus: 180, bend: -210, obstacles: [[.38, 0, 'barricade'], [.7, 1, 'puddle']] },
    { direction: 'forward', type: 'shortcut', risk: 5, bonus: 500, bend: 0, obstacles: [[.2, -1, 'gate_closing'], [.43, 1, 'construction'], [.68, 0, 'crowd_surge']] },
    { direction: 'right', type: 'festival', risk: 5, bonus: 420, bend: 230, obstacles: [[.22, 1, 'puddle'], [.48, 0, 'gate_closing'], [.74, -1, 'barricade']] },
  ]},
];

const initialRoad: RoadSegment = {
  id: 'road_departure', startNode: START_NODE, endNode: stages[0].id, lanes: 3, length: 680,
  difficulty: 1, actRequirement: 'DUSK', rangoliNode: false, type: 'safe', scoreMultiplier: 1,
  obstacleSlots: [{ position: .58, lane: 1, type: 'barricade', difficulty: 1 }],
  waypoints: [{ x: 0, y: 980 }, { x: 300, y: 850 }, stages[0].position],
};

const branchRoads: RoadSegment[] = stages.flatMap((stage, stageIndex) => {
  const nextNode = stages[stageIndex + 1]?.id ?? END_NODE;
  return stage.options.map((option) => ({
    id: `road_${stageIndex + 1}_${option.direction}`,
    startNode: stage.id,
    endNode: nextNode,
    lanes: 3,
    length: 720,
    difficulty: Math.min(5, option.risk),
    actRequirement: stageIndex < 1 ? 'DUSK' : stageIndex < 3 ? 'CITY_AWAKENS' : stageIndex < 5 ? 'VIGHNAS' : stageIndex < 7 ? 'MONSOON' : 'FINAL_PUSH',
    rangoliNode: option.type === 'festival',
    type: option.type,
    obstacleSlots: option.obstacles.map((item) => slot(item, option.risk)),
    scoreMultiplier: option.type === 'multiplier' ? 2 : option.type === 'shortcut' ? 1.35 : option.type === 'festival' ? 1.2 : 1,
    waypoints: [stage.position, { x: (stage.position.x + stage.next.x) / 2, y: (stage.position.y + stage.next.y) / 2 + option.bend }, stage.next],
  }));
});

export const ROAD_SEGMENTS: RoadSegment[] = [initialRoad, ...branchRoads];

export const JUNCTIONS: JunctionData[] = stages.map((stage, stageIndex) => ({
  id: stage.id,
  position: stage.position,
  rhythmBeat: stage.beat,
  decisionWindowMs: Math.max(1200, 2050 - stageIndex * 90),
  exits: stage.options.map((option) => ({ roadId: `road_${stageIndex + 1}_${option.direction}`, direction: option.direction, type: option.type, riskLevel: option.risk, scoreBonus: option.bonus })),
}));

export const WORLD_BOUNDS = { x: -500, y: -300, width: 7600, height: 2100 };
export const DESTINATION = stages[stages.length - 1].next;

export const DECISION_CHALLENGES: DecisionChallenge[] = [
  { junctionId: 'node_pandal', situation: 'A barricade is closing while families gather on the right.', question: 'Which route keeps the procession moving safely?', correctDirection: 'left', explanation: 'The left service lane clears the closure before it locks.', options: [
    { direction: 'left', label: 'Service lane', detail: 'Narrow · gate still open' }, { direction: 'forward', label: 'Main road', detail: 'Barricade closing' }, { direction: 'right', label: 'Festival street', detail: 'Dense family crowd' },
  ]},
  { junctionId: 'node_bazaar', situation: 'A handcart crosses left and a delivery truck is turning right.', question: 'Read the movement. Where is the clear gap?', correctDirection: 'forward', explanation: 'The centre opens between both crossing movements.', options: [
    { direction: 'left', label: 'Spice lane', detail: 'Handcart crossing' }, { direction: 'forward', label: 'Market centre', detail: 'Gap opening now' }, { direction: 'right', label: 'Loading road', detail: 'Truck turning' },
  ]},
  { junctionId: 'node_tilak', situation: 'The procession canopy needs full overhead clearance.', question: 'Which street has no low wires or arch?', correctDirection: 'right', explanation: 'The decorated avenue has the marked high-clearance arch.', options: [
    { direction: 'left', label: 'Old lane', detail: 'Low utility wires' }, { direction: 'forward', label: 'Clock street', detail: 'Low festival arch' }, { direction: 'right', label: 'Decorated avenue', detail: 'High clearance' },
  ]},
  { junctionId: 'node_market', situation: 'A temporary gate will close in seconds.', question: 'Which route reaches the opening before it shuts?', correctDirection: 'left', explanation: 'The short left alley is the only route inside the timing window.', options: [
    { direction: 'left', label: 'Needle alley', detail: 'Short · closing soon' }, { direction: 'forward', label: 'Market loop', detail: 'Safe but too long' }, { direction: 'right', label: 'Flower street', detail: 'Crowd delay' },
  ]},
  { junctionId: 'node_bridge', situation: 'Monsoon water is rising on both lower approaches.', question: 'Choose the road with reliable drainage.', correctDirection: 'forward', explanation: 'The centre bridge is elevated above the flooded lanes.', options: [
    { direction: 'left', label: 'River market', detail: 'Water rising' }, { direction: 'forward', label: 'Centre bridge', detail: 'Elevated road' }, { direction: 'right', label: 'Underpass', detail: 'Flood warning' },
  ]},
  { junctionId: 'node_monsoon', situation: 'Heavy rain hides the lane markings. Listen and look for guidance.', question: 'Which path has working diya markers?', correctDirection: 'right', explanation: 'The right festival street is marked by continuous diyas.', options: [
    { direction: 'left', label: 'Mill shortcut', detail: 'No lighting' }, { direction: 'forward', label: 'Canal road', detail: 'Markers submerged' }, { direction: 'right', label: 'Diya street', detail: 'Lights visible' },
  ]},
  { junctionId: 'node_blackout', situation: 'The power fails. Only community lights remain.', question: 'Which signal confirms an open street?', correctDirection: 'left', explanation: 'Volunteers on the left are holding steady amber lamps—the agreed safe-route signal.', options: [
    { direction: 'left', label: 'Lamp line', detail: 'Steady amber signal' }, { direction: 'forward', label: 'Dark avenue', detail: 'No marshal visible' }, { direction: 'right', label: 'Flashing gate', detail: 'Closure warning' },
  ]},
  { junctionId: 'node_oldcity', situation: 'Two crowd streams are crossing from opposite sides.', question: 'Where will the crossing naturally create space?', correctDirection: 'forward', explanation: 'The streams separate through the centre after the dhol cue.', options: [
    { direction: 'left', label: 'Courtyard cut', detail: 'Crowd entering' }, { direction: 'forward', label: 'Old city spine', detail: 'Gap after the beat' }, { direction: 'right', label: 'Temple row', detail: 'Crowd exiting' },
  ]},
  { junctionId: 'node_waterfront', situation: 'The ghat is visible. One final road preserves the complete rangoli.', question: 'Finish safely and complete the pattern.', correctDirection: 'right', explanation: 'The right lantern route joins the final rangoli petal at the ghat.', options: [
    { direction: 'left', label: 'Direct ramp', detail: 'Safe · breaks pattern' }, { direction: 'forward', label: 'Fast steps', detail: 'Too narrow for canopy' }, { direction: 'right', label: 'Lantern route', detail: 'Rangoli node ahead' },
  ]},
];
