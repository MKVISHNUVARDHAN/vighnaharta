import type { RangoliPattern } from '@/types/game';

// Recipes use route ids. A run naturally uncovers only some patterns, encouraging replay.
export const RANGOLI_PATTERNS: RangoliPattern[] = [
  { id: 'rangoli_diya', name: 'Diya Spiral', requiredNodes: ['road_1_right', 'road_3_right', 'road_5_left'], scoreBonus: 1800, isHidden: false, geometryType: 'circle' },
  { id: 'rangoli_lotus', name: 'Lotus of Eight Lights', requiredNodes: ['road_2_left', 'road_4_right', 'road_6_right'], scoreBonus: 2400, isHidden: false, geometryType: 'lotus' },
  { id: 'rangoli_diamond', name: 'Diamond of Mangal', requiredNodes: ['road_3_left', 'road_5_right', 'road_7_left'], scoreBonus: 3000, isHidden: true, geometryType: 'diamond' },
  { id: 'rangoli_harmony', name: 'Mandala of Harmony', requiredNodes: ['road_2_right', 'road_6_left', 'road_8_right'], scoreBonus: 4200, isHidden: true, geometryType: 'circle' },
  { id: 'rangoli_path', name: 'Pathfinder Lotus', requiredNodes: ['road_4_left', 'road_7_right', 'road_9_right'], scoreBonus: 5000, isHidden: true, geometryType: 'lotus' },
];
