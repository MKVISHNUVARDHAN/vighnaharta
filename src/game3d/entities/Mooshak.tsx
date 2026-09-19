import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { InputManager } from '../systems/InputManager';
import { useGameStore } from '@/stores/gameStore';
import { SharedState } from '../systems/SharedState';

// ── Movement Constants ──
const MOVE_FORCE = 28;
const MAX_SPEED = 16;
const JUMP_IMPULSE = 10;
const JUMP_CUT_MULTIPLIER = 0.4; // variable jump height
const AIR_CONTROL = 0.4;
const GROUND_DRAG = 0.92;
const AIR_DRAG = 0.98;
const COYOTE_TIME = 0.12;   // seconds
const JUMP_BUFFER = 0.15;   // seconds
const MAX_FALL_SPEED = -30;

// ── Visual ── Blender-Principled PBR values (albedo mid-range, binary metal)
const BODY_COLOR = '#8a6a4e';       // warm mouse brown (0.05–0.8 range)
const BELLY_COLOR = '#c9a173';      // lighter undercoat
const EAR_COLOR = '#d89a7d';        // pink-tan inner ear
const TAIL_COLOR = '#6b4a30';       // darker tail
const EYE_COLOR = '#14101a';        // near-black, glossy (roughness 0.15)
const CLOTH_COLOR = '#c22e3a';      // festive vermilion vest
const BRASS_COLOR = '#8a5a1a';      // sacred-thread brass (metallic 1.0)

export function Mooshak() {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);

  // Movement state
  const moveState = useRef({
    isGrounded: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    lastJumpTime: 0,
    wasJumpHeld: false,
    velocity: new THREE.Vector3(),
    forward: new THREE.Vector3(0, 0, -1),
    targetRotation: 0,
    currentRotation: 0,
    speed: 0,
    tailWag: 0,
    lastGroundY: 0,
  });

  useFrame((state, delta) => {
    const rb = rigidBodyRef.current;
    const mesh = meshGroupRef.current;
    if (!rb || !mesh) return;

    const dt = Math.min(delta, 0.05); // cap delta
    const input = InputManager.getInstance().getState();
    const ms = moveState.current;

    // ── Get current velocity ──
    const linvel = rb.linvel();
    ms.velocity.set(linvel.x, linvel.y, linvel.z);
    const horizontalSpeed = Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);
    ms.speed = horizontalSpeed;

    // ── Ground Detection ──
    const pos = rb.translation();

    // Simpler ground check using velocity
    const wasGrounded = ms.isGrounded;
    const groundCheckY = 0.4; // capsule half-height + small margin
    const nearGround = pos.y < (ms.lastGroundY + groundCheckY + 0.1);
    ms.isGrounded = nearGround && linvel.y > -2 && linvel.y < 2;
    if (ms.isGrounded) ms.lastGroundY = pos.y;

    // ── Coyote Time ──
    if (wasGrounded && !ms.isGrounded) {
      ms.coyoteTimer = COYOTE_TIME;
    }
    if (ms.coyoteTimer > 0) {
      ms.coyoteTimer -= dt;
    }

    // ── Jump Buffer ──
    if (input.jumpJustPressed) {
      ms.jumpBufferTimer = JUMP_BUFFER;
    }
    if (ms.jumpBufferTimer > 0) {
      ms.jumpBufferTimer -= dt;
    }

    // ── Movement Input ──
    const inputX = input.moveX;
    const inputZ = input.moveZ;
    const hasInput = Math.abs(inputX) > 0.1 || Math.abs(inputZ) > 0.1;

    if (hasInput) {
      // Calculate move direction relative to camera
      const moveDir = new THREE.Vector3(inputX, 0, inputZ).normalize();
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), SharedState.cameraYaw);
      const controlMultiplier = ms.isGrounded ? 1.0 : AIR_CONTROL;
      const force = MOVE_FORCE * controlMultiplier;

      // Apply force only if below max speed
      if (horizontalSpeed < MAX_SPEED) {
        rb.applyImpulse(
          { x: moveDir.x * force * dt, y: 0, z: moveDir.z * force * dt },
          true
        );
      }

      // Target rotation
      ms.targetRotation = Math.atan2(moveDir.x, moveDir.z);
      ms.forward.copy(moveDir);
    }

    // ── Drag ──
    const baseDragFactor = ms.isGrounded ? GROUND_DRAG : AIR_DRAG;
    const dragFactor = Math.pow(baseDragFactor, dt * 60);
    if (horizontalSpeed > 0.1) {
      rb.setLinvel(
        {
          x: linvel.x * dragFactor,
          y: Math.max(linvel.y, MAX_FALL_SPEED),
          z: linvel.z * dragFactor,
        },
        true
      );
    }

    // ── Jump ──
    const canJump = ms.isGrounded || ms.coyoteTimer > 0;
    const wantsJump = ms.jumpBufferTimer > 0;

    if (canJump && wantsJump) {
      rb.setLinvel({ x: linvel.x, y: 0, z: linvel.z }, true);
      rb.applyImpulse({ x: 0, y: JUMP_IMPULSE, z: 0 }, true);
      ms.coyoteTimer = 0;
      ms.jumpBufferTimer = 0;
      ms.wasJumpHeld = true;
      ms.lastJumpTime = performance.now();
    }

    // ── Variable Jump Height ──
    if (ms.wasJumpHeld && !input.jump && linvel.y > 0) {
      rb.setLinvel(
        { x: linvel.x, y: linvel.y * JUMP_CUT_MULTIPLIER, z: linvel.z },
        true
      );
      ms.wasJumpHeld = false;
    }
    if (ms.isGrounded) {
      ms.wasJumpHeld = false;
    }

    // ── Visual: Position & Rotation ──
    mesh.position.set(pos.x, pos.y - 0.5, pos.z);

    // Smooth rotation
    const rotDiff = ms.targetRotation - ms.currentRotation;
    let adjustedDiff = ((rotDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (adjustedDiff < -Math.PI) adjustedDiff += Math.PI * 2;
    ms.currentRotation += adjustedDiff * Math.min(1, dt * 12);
    mesh.rotation.y = ms.currentRotation;

    // ── Visual: Speed lean ──
    const leanAmount = Math.min(horizontalSpeed / MAX_SPEED, 1) * 0.15;
    mesh.rotation.x = leanAmount;

    // ── Visual: Squash & stretch ──
    const squashTarget = ms.isGrounded
      ? 1.0 - Math.min(horizontalSpeed / MAX_SPEED, 1) * 0.05
      : linvel.y > 2
        ? 0.85  // stretched while going up
        : linvel.y < -3
          ? 1.15  // squashed while falling
          : 1.0;

    const currentScaleY = mesh.scale.y;
    mesh.scale.y = THREE.MathUtils.lerp(currentScaleY, squashTarget, dt * 8);
    const perpendicularScale = 1 / Math.sqrt(squashTarget);
    mesh.scale.x = THREE.MathUtils.lerp(mesh.scale.x, perpendicularScale, dt * 8);
    mesh.scale.z = THREE.MathUtils.lerp(mesh.scale.z, perpendicularScale, dt * 8);

    // ── Visual: Tail wag ──
    if (tailRef.current) {
      ms.tailWag += dt * (3 + horizontalSpeed * 0.8);
      const wagAngle = Math.sin(ms.tailWag) * (0.2 + horizontalSpeed * 0.03);
      tailRef.current.rotation.z = wagAngle;
      tailRef.current.rotation.x = -0.6 - horizontalSpeed * 0.02;
    }

    // ── Store player position for camera and HUD ──
    SharedState.mooshakPos.x = pos.x;
    SharedState.mooshakPos.y = pos.y;
    SharedState.mooshakPos.z = pos.z;
    SharedState.mooshakSpeed = horizontalSpeed;
  });

  return (
    <>
      {/* Physics body */}
      <RigidBody
        ref={rigidBodyRef}
        position={[0, 2, 0]}
        colliders={false}
        mass={1}
        linearDamping={0.1}
        angularDamping={5}
        lockRotations
        enabledRotations={[false, false, false]}
        ccd
      >
        <CapsuleCollider args={[0.3, 0.35]} position={[0, 0.65, 0]} />
      </RigidBody>

      {/* Visual mesh (follows physics body) */}
      <group ref={meshGroupRef}>
        {/* Body - ellipsoid, PBR fur: high rough, faint warm sheen */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.4, 20, 16]} />
          <meshStandardMaterial
            color={BODY_COLOR}
            roughness={0.85}
            metalness={0}
            emissive="#2a1206"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Belly patch — lighter undercoat catches rim light */}
        <mesh position={[0, 0.38, -0.22]}>
          <sphereGeometry args={[0.26, 14, 12]} />
          <meshStandardMaterial color={BELLY_COLOR} roughness={0.9} metalness={0} />
        </mesh>

        {/* Festive vest band — vermilion cloth */}
        <mesh position={[0, 0.62, 0.02]} rotation={[0.35, 0, 0]}>
          <torusGeometry args={[0.32, 0.09, 10, 20]} />
          <meshStandardMaterial color={CLOTH_COLOR} roughness={0.75} metalness={0} />
        </mesh>

        {/* Sacred brass bead — the ONE metal accent (binary metallic) */}
        <mesh position={[0, 0.5, -0.32]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color={BRASS_COLOR} metalness={1.0} roughness={0.32} />
        </mesh>

        {/* Head */}
        <mesh castShadow position={[0, 0.85, -0.2]}>
          <sphereGeometry args={[0.28, 16, 14]} />
          <meshStandardMaterial
            color={BODY_COLOR}
            roughness={0.85}
            metalness={0}
            emissive="#2a1206"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Snout */}
        <mesh position={[0, 0.78, -0.45]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color={BELLY_COLOR} roughness={0.85} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, 0.8, -0.55]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={EYE_COLOR} roughness={0.15} metalness={0} />
        </mesh>

        {/* Left ear — outer fur + inner glow (subsurface fake) */}
        <mesh castShadow position={[-0.18, 1.1, -0.15]} rotation={[0, 0, -0.3]}>
          <circleGeometry args={[0.15, 12]} />
          <meshStandardMaterial color={BODY_COLOR} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.18, 1.09, -0.16]} rotation={[0, 0, -0.3]}>
          <circleGeometry args={[0.09, 10]} />
          <meshStandardMaterial
            color={EAR_COLOR}
            roughness={0.6}
            side={THREE.DoubleSide}
            emissive="#5a1f14"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Right ear */}
        <mesh castShadow position={[0.18, 1.1, -0.15]} rotation={[0, 0, 0.3]}>
          <circleGeometry args={[0.15, 12]} />
          <meshStandardMaterial color={BODY_COLOR} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.18, 1.09, -0.16]} rotation={[0, 0, 0.3]}>
          <circleGeometry args={[0.09, 10]} />
          <meshStandardMaterial
            color={EAR_COLOR}
            roughness={0.6}
            side={THREE.DoubleSide}
            emissive="#5a1f14"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Left eye — glossy, catches key-light highlight */}
        <mesh position={[-0.12, 0.92, -0.4]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={EYE_COLOR} roughness={0.15} metalness={0} />
        </mesh>

        {/* Right eye */}
        <mesh position={[0.12, 0.92, -0.4]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={EYE_COLOR} roughness={0.15} metalness={0} />
        </mesh>

        {/* Eye highlights */}
        <mesh position={[-0.11, 0.94, -0.44]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.13, 0.94, -0.44]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
        </mesh>

        {/* Tail group */}
        <group ref={tailRef} position={[0, 0.5, 0.35]}>
          {/* Tail segments */}
          <mesh castShadow position={[0, 0.15, 0.2]} rotation={[-0.6, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.03, 0.5, 8]} />
            <meshStandardMaterial color={TAIL_COLOR} roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0, 0.4, 0.45]} rotation={[-1.0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.015, 0.4, 8]} />
            <meshStandardMaterial color={TAIL_COLOR} roughness={0.85} />
          </mesh>
          {/* Tail tip — brass bell so turns read at distance */}
          <mesh position={[0, 0.6, 0.6]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={BRASS_COLOR} metalness={1.0} roughness={0.3} />
          </mesh>
        </group>

        {/* Feet (subtle) */}
        <mesh position={[-0.15, 0.08, -0.1]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color={BODY_COLOR} roughness={0.8} />
        </mesh>
        <mesh position={[0.15, 0.08, -0.1]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color={BODY_COLOR} roughness={0.8} />
        </mesh>
        <mesh position={[-0.12, 0.08, 0.15]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshStandardMaterial color={BODY_COLOR} roughness={0.8} />
        </mesh>
        <mesh position={[0.12, 0.08, 0.15]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshStandardMaterial color={BODY_COLOR} roughness={0.8} />
        </mesh>
      </group>
    </>
  );
}
