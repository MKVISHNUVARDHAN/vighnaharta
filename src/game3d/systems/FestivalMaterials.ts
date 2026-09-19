import * as THREE from 'three';

/**
 * Shared Blender-Principled PBR palette.
 * Follows the 2026 game-ready checklist:
 * - albedo 0.05–0.8 (no pure black / pure white except emissive flames)
 * - metallic binary 0 or 1, roughness never exactly 0
 * - data maps would be Non-Color; emissive flames HDR (>1) for selective bloom
 */

export const FestivalPalette = {
  marigold: '#c46a1a',
  marigoldBright: '#e8891e',
  brass: '#8a5a1a',
  copper: '#7d4a24',
  vermilion: '#a8321f',
  roadStone: '#6e5a4c',
  roadEdge: '#54443a',
  wallPlaster: '#b98a5e',
  wallTrim: '#7d4a2a',
  leafGreen: '#2e6b34',
  diyaFlame: '#ffb02e',
  rangoliPink: '#c22e6a',
  rangoliTeal: '#1e8a8a',
} as const;

export function pbr(
  color: string,
  roughness: number,
  metalness = 0
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: THREE.MathUtils.clamp(roughness, 0.02, 1),
    metalness,
  });
}

/** Pre-built shared materials so every prop uses ONE consistent response. */
export const FestivalMaterials = {
  brass: () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(FestivalPalette.brass),
      metalness: 1.0,
      roughness: 0.35,
    }),
  copper: () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(FestivalPalette.copper),
      metalness: 1.0,
      roughness: 0.45,
    }),
  marigold: () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(FestivalPalette.marigold),
      metalness: 0,
      roughness: 0.55,
      emissive: new THREE.Color('#3a1500'),
      emissiveIntensity: 0.35,
    }),
  leaf: () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(FestivalPalette.leafGreen),
      metalness: 0,
      roughness: 0.7,
    }),
  plaster: () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(FestivalPalette.wallPlaster),
      metalness: 0,
      roughness: 0.9,
    }),
  road: () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(FestivalPalette.roadStone),
      metalness: 0,
      roughness: 0.95,
    }),
};
