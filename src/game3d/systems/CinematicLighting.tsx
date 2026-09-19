import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { SharedState } from './SharedState';

/**
 * CinematicLighting — 2026 festival-sunset rig.
 *
 * Research basis (Sept 2026):
 * - three.js 2026 post guide: ACES/AgX tone map once at end, selective bloom
 *   (threshold ~0.85, only HDR emissive >1 blooms), IBL + key light.
 * - Blender 4.x/5 PBR rules: albedo 0.05–0.8 (no pure black/white),
 *   metallic binary 0/1, roughness never exactly 0, ORM Non-Color.
 * - Teal-orange contrast: warm key (sunset gold) vs cool rim (dusk teal).
 *
 * No external HDR downloads — IBL comes from locally-rendered Lightformers
 * so there are no hot-links and no uncertain licences.
 */

// Flickering diya practical — one warm point light + emissive flame mesh.
function Diya({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const seed = useRef(Math.random() * 100);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() + seed.current;
    // Candle flicker: fast small noise + slow breath
    const flicker =
      1 +
      Math.sin(t * 11.3) * 0.08 +
      Math.sin(t * 23.7) * 0.05 +
      Math.sin(t * 5.1) * 0.06;
    if (lightRef.current) lightRef.current.intensity = 6 * flicker;
    if (flameRef.current) {
      const s = 1 + Math.sin(t * 13.0) * 0.08;
      flameRef.current.scale.set(s, 1 / Math.sqrt(s), s);
    }
  });

  return (
    <group position={position}>
      {/* Brass bowl — binary metallic, mid roughness (Blender checklist) */}
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.16, 0.09, 0.12, 16]} />
        <meshStandardMaterial
          color="#8a5a1a"
          metalness={1.0}
          roughness={0.35}
        />
      </mesh>
      {/* Flame — HDR emissive so ONLY this blooms (threshold 1.0) */}
      <mesh ref={flameRef} position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#ffb02e"
          emissiveIntensity={3.5}
          roughness={1}
          toneMapped={false}
        />
      </mesh>
      {/* Halo shell — additive, cheap glow without extra bloom cost */}
      <mesh position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshBasicMaterial
          color="#ff9e2c"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color="#ff9e2c"
        intensity={6}
        distance={9}
        decay={2}
        position={[0, 0.5, 0]}
      />
    </group>
  );
}

// Fake volumetric shaft — additive plane, no post pass cost.
function LightShaft({
  position,
  rotation = [0, 0, 0.35],
  height = 14,
  opacity = 0.06,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  height?: number;
  opacity?: number;
}) {
  return (
    <mesh position={position} rotation={new THREE.Euler(...rotation)}>
      <planeGeometry args={[3.2, height]} />
      <meshBasicMaterial
        color="#ffd699"
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
        fog={false}
      />
    </mesh>
  );
}

export function CinematicLighting() {
  return (
    <>
      {/* ── KEY: low warm sun, shadows, physical falloff ── */}
      <directionalLight
        position={[26, 14, 14]}
        intensity={3.0}
        color="#ffb066"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      {/* ── FILL: sky bounce so shadows stay readable (no pure black) ── */}
      <hemisphereLight
        args={['#7d8fb0', '#4a3220', 0.55]}
      />

      {/* ── RIM: cool dusk-teal back light for teal-orange separation ── */}
      <directionalLight
        position={[-18, 12, -28]}
        intensity={1.1}
        color="#5ec8d8"
      />

      {/* ── BOUNCE: faint warm lift from below-front (festival ground glow) ── */}
      <directionalLight
        position={[0, 4, 30]}
        intensity={0.35}
        color="#ff8a4a"
      />

      {/* ── IBL: locally rendered studio — NO external HDR fetch ──
          Warm strip (sun) + cool strip (dusk sky) + soft top.
          Gives PBR metals/ceramics real reflections. */}
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer
            form="circle"
            intensity={5}
            position={[0, 5, -9]}
            scale={4}
            color="#ffd9a0"
          />
          <Lightformer
            form="rect"
            intensity={1.2}
            position={[-5, 1, -1]}
            scale={[8, 2, 1]}
            color="#4a7d96"
          />
          <Lightformer
            form="rect"
            intensity={0.8}
            position={[5, -1, -1]}
            scale={[8, 2, 1]}
            color="#ff9e5e"
          />
          <Lightformer
            form="rect"
            intensity={0.6}
            position={[0, 5, 0]}
            scale={[10, 10, 1]}
            color="#fff2dd"
          />
        </group>
      </Environment>

      {/* ── SKY + DEPTH FOG: warm horizon, cool zenith, exp decay ── */}
      <Sky
        distance={450000}
        sunPosition={[26, 7, -18]}
        inclination={0.52}
        azimuth={0.28}
        rayleigh={1.2}
        turbidity={9}
        mieCoefficient={0.008}
        mieDirectionalG={0.85}
      />
      <fog attach="fog" args={['#d89a62', 55, 165]} />

      {/* ── PRACTICALS: diyas line the ceremonial road ──
          Real point lights (few, short range) = motivated warm pools. */}
      <Diya position={[-3.4, 0.28, -8]} />
      <Diya position={[3.4, 0.28, -14]} />
      <Diya position={[-5.4, 0.28, -38]} />
      <Diya position={[5.4, 0.28, -46]} />
      <Diya position={[-5.2, -1.7, -62]} />
      <Diya position={[5.2, -1.7, -70]} />

      {/* ── LIGHT SHAFTS: sunset rays through gate posts ── */}
      <LightShaft position={[-2, 6, -20]} />
      <LightShaft position={[2.5, 6, -45]} rotation={[0, 0.4, 0.35]} />
      <LightShaft position={[0, 5, -70]} rotation={[0, -0.4, 0.35]} opacity={0.05} />
    </>
  );
}
