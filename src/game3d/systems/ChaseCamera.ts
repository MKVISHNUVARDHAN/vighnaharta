import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { InputManager } from './InputManager';

import { SharedState } from './SharedState';

// ── Camera Configuration ──
const BASE_DISTANCE = 10;
const BASE_HEIGHT = 6;
const BASE_LOOK_AHEAD = 3;
const FAST_FOV = 65;
const SLOW_FOV = 50;
const LERP_POSITION = 4.5;
const LERP_TARGET = 6;
const LERP_FOV = 3;

interface CameraState {
  yaw: number;
  pitch: number;
  targetPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  lookTarget: THREE.Vector3;
}

export function ChaseCamera() {
  const { camera } = useThree();
  const state = useRef<CameraState>({
    yaw: Math.PI,  // behind player
    pitch: 0.35,
    targetPos: new THREE.Vector3(0, BASE_HEIGHT, BASE_DISTANCE),
    currentPos: new THREE.Vector3(0, BASE_HEIGHT, BASE_DISTANCE),
    lookTarget: new THREE.Vector3(0, 1, 0),
  });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const cs = state.current;
    const input = InputManager.getInstance().getState();

    // Get player position
    const playerPos = SharedState.mooshakPos;
    const playerSpeed = SharedState.mooshakSpeed;
    const px = playerPos.x;
    const py = playerPos.y;
    const pz = playerPos.z;

    // ── Mouse look (desktop only) ──
    if (!InputManager.getInstance().isMobile) {
      cs.yaw -= input.lookDeltaX * 0.003;
      cs.pitch = THREE.MathUtils.clamp(
        cs.pitch - input.lookDeltaY * 0.003,
        0.05,
        0.85
      );
    }

    // ── Speed-reactive distance and height ──
    const speedRatio = Math.min(playerSpeed / 16, 1);
    const distance = BASE_DISTANCE + speedRatio * 3;
    const height = BASE_HEIGHT + speedRatio * 1.5;
    const lookAhead = BASE_LOOK_AHEAD + speedRatio * 2;

    // ── Calculate ideal camera position ──
    const offsetX = Math.sin(cs.yaw) * Math.cos(cs.pitch) * distance;
    const offsetZ = Math.cos(cs.yaw) * Math.cos(cs.pitch) * distance;
    const offsetY = Math.sin(cs.pitch) * distance + height;

    cs.targetPos.set(
      px + offsetX,
      py + offsetY,
      pz + offsetZ
    );

    // ── Smooth follow ──
    cs.currentPos.lerp(cs.targetPos, dt * LERP_POSITION);

    // ── Look target (slightly ahead of player) ──
    const forwardX = -Math.sin(cs.yaw);
    const forwardZ = -Math.cos(cs.yaw);
    cs.lookTarget.set(
      px + forwardX * lookAhead,
      py + 1,
      pz + forwardZ * lookAhead
    );

    // ── Apply ──
    camera.position.copy(cs.currentPos);
    const lerpedTarget = new THREE.Vector3().copy(camera.position);
    lerpedTarget.lerp(cs.lookTarget, 1); // instant for now
    camera.lookAt(cs.lookTarget);

    // ── Speed-reactive FOV ──
    const targetFov = THREE.MathUtils.lerp(SLOW_FOV, FAST_FOV, speedRatio);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, dt * LERP_FOV);
      camera.updateProjectionMatrix();
    }

    SharedState.cameraYaw = cs.yaw;

    // ── End frame for input ──
    InputManager.getInstance().endFrame();
  });

  return null;
}
