import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  ToneMapping,
  SMAA,
  Noise,
  HueSaturation,
  BrightnessContrast,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { SharedState } from '@/game3d/systems/SharedState';

/**
 * 2026 cinematic chain — ORDER MATTERS:
 * Bloom (HDR selective) → colour grade → grain → vignette → CA → ToneMap → AA
 * - Bloom threshold 1.0: only diya flames / emissive >1 glow, road never hazes.
 * - ToneMapping ACES once at end (renderer NoToneMapping while composing).
 * - SMAA last so it smooths the final composited image.
 * - HalfFloat frame buffer for real HDR (no banding in sunset gradient).
 */
export function PostProcessing() {
  const chromaticAberrationRef = useRef<any>(null);

  useFrame(() => {
    if (chromaticAberrationRef.current) {
      // Subtle speed energy — clamped low so it stays filmic, not cheap.
      const offset = Math.min(
        0.0006 + SharedState.mooshakSpeed * 0.00008,
        0.0022
      );
      chromaticAberrationRef.current.offset.set(offset, offset * 0.7);
    }
  });

  return (
    <EffectComposer multisampling={4} frameBufferType={THREE.HalfFloatType}>
      <Bloom
        mipmapBlur
        intensity={0.85}
        luminanceThreshold={1.0}
        luminanceSmoothing={0.2}
      />
      {/* Warm festival grade: slight saturation lift, gentle contrast */}
      <HueSaturation saturation={0.18} />
      <BrightnessContrast brightness={0.02} contrast={0.12} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.12} />
      <Vignette
        darkness={0.55}
        offset={0.28}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        ref={chromaticAberrationRef}
        offset={new THREE.Vector2(0.0006, 0.0004)}
        radialModulation
        modulationOffset={0.4}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}
