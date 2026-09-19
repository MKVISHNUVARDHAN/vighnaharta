import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { Environment, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';

import { Mooshak } from './entities/Mooshak';
import { GreyboxLevel } from './levels/GreyboxLevel';
import { FestivalDressing } from './levels/FestivalDressing';
import { CinematicLighting } from './systems/CinematicLighting';
import { ChaseCamera } from './systems/ChaseCamera';
import { InputManager } from './systems/InputManager';
import { AudioManager } from './systems/AudioManager';
import { SharedState } from './systems/SharedState';
import { useGameStore } from '@/stores/gameStore';
import { PostProcessing } from '@/game3d/systems/PostProcessing';
import { ParticleEffects } from '@/game3d/systems/ParticleEffects';

// ── Game Clock ── tracks elapsed time
function GameClock() {
  const setTimeElapsed = useGameStore((s) => s.setTimeElapsed);
  const startTime = useRef(0);

  useEffect(() => {
    startTime.current = performance.now();
  }, []);

  useFrame(() => {
    const elapsed = (performance.now() - startTime.current) / 1000;
    setTimeElapsed(elapsed);
  });

  return null;
}

// ── Audio System ──
function AudioSystem() {
  const processionDistance = useGameStore((s) => s.procession.distance);
  const audioManager = AudioManager.getInstance();
  const lastFootstepTime = useRef(0);

  useEffect(() => {
    audioManager.setCrowdDistance(processionDistance);
  }, [processionDistance, audioManager]);

  useFrame((state) => {
    const speed = SharedState.mooshakSpeed;
    if (speed > 2) {
      // Calculate interval based on speed
      const baseInterval = 0.4;
      const speedFactor = Math.max(0.4, 1 - (speed / 30));
      const interval = baseInterval * speedFactor;
      
      const now = state.clock.getElapsedTime();
      if (now - lastFootstepTime.current > interval) {
        audioManager.playFootstep();
        lastFootstepTime.current = now;
      }
    }
  });

  return null;
}

// ── Lighting ── cinematic festival-sunset rig (2026: key + IBL + practicals)
// See systems/CinematicLighting.tsx for research basis.
function FestivalLighting() {
  return <CinematicLighting />;
}

// ── Ground Plane ── PBR earth (albedo mid-range, never pure black/white)
function Ground() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[200, 0.1, 200]} position={[0, -0.1, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial
          color="#7d5c40"
          roughness={0.96}
          metalness={0.0}
        />
      </mesh>
    </RigidBody>
  );
}

// ── HUD Distance Display (3D overlay) ──
function DistanceMarker() {
  const distance = useGameStore((s) => s.procession.distance);
  const bells = useGameStore((s) => s.procession.bellsRemaining);

  // This component doesn't render in 3D — it's managed by React HUD overlay
  return null;
}

// ── Main World Component ──
export function World() {
  // Initialize input manager
  useEffect(() => {
    const input = InputManager.getInstance();
    input.init();

    const audio = AudioManager.getInstance();
    audio.init();
    audio.startMusic();

    return () => {
      input.destroy();
      audio.stopMusic();
      audio.destroy();
    };
  }, []);

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      dpr={[1, 1.5]}
      camera={{ fov: 55, near: 0.1, far: 300, position: [0, 8, 12] }}
      style={{ width: '100%', height: '100%', display: 'block' }}
      onCreated={({ gl }) => {
        // 2026 rule: renderer stays NoToneMapping while EffectComposer owns
        // the single ACES pass at the end — otherwise double tone-map wash.
        gl.toneMapping = THREE.NoToneMapping;
        gl.toneMappingExposure = 1.15;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <Physics
        gravity={[0, -25, 0]}
        timeStep="vary"
      >
        <FestivalLighting />
        <Ground />
        <Mooshak />
        <GreyboxLevel />
        <FestivalDressing />
        <ChaseCamera />
        <GameClock />
        <AudioSystem />
        <DistanceMarker />
        <ParticleEffects />
      </Physics>
      <PostProcessing />
    </Canvas>
  );
}
