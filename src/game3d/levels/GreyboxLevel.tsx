import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';

// ── Colors ──
const ROAD = '#8a7160';
const WALL = '#d4a06a';
const RAMP = '#b8845a';
const PLATFORM = '#c49470';
const ROPE_ANCHOR = '#e8a317';
const OBSTACLE = '#d4442a';
const TUNNEL = '#6b4226';
const CRATE = '#a37548';

// ── Helper: Box with physics ──
function PhysicsBox({ position, size, color, type = 'fixed' as const }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  type?: 'fixed' | 'dynamic';
}) {
  return (
    <RigidBody type={type} position={position} colliders={false} mass={type === 'dynamic' ? 2 : 0}>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </RigidBody>
  );
}

// ── Rope Anchor Point (visual marker for tail swing targets) ──
function SwingAnchor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Post */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
        <meshStandardMaterial color={ROPE_ANCHOR} emissive={ROPE_ANCHOR} emissiveIntensity={0.3} />
      </mesh>
      {/* Glow sphere */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.15, 12, 8]} />
        <meshStandardMaterial
          color="#ffd36a"
          emissive="#ffd36a"
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

export function GreyboxLevel() {
  return (
    <group>
      {/* ══════════════════════════════════════════
          SECTION 1: Starting Street (0s-12s)
          Simple flat road to learn movement
          ══════════════════════════════════════════ */}

      {/* Main road — wide, flat */}
      <PhysicsBox position={[0, -0.25, -15]} size={[8, 0.5, 40]} color={ROAD} />

      {/* Left wall */}
      <PhysicsBox position={[-4.5, 1.5, -15]} size={[1, 3, 40]} color={WALL} />
      {/* Right wall */}
      <PhysicsBox position={[4.5, 1.5, -15]} size={[1, 3, 40]} color={WALL} />

      {/* Decorative boxes along walls */}
      <PhysicsBox position={[-3.2, 0.4, -5]} size={[0.8, 0.8, 0.8]} color={CRATE} />
      <PhysicsBox position={[3.2, 0.4, -8]} size={[1, 0.6, 0.6]} color={CRATE} />
      <PhysicsBox position={[-3, 0.3, -12]} size={[0.6, 0.6, 0.6]} color={CRATE} />

      {/* ══════════════════════════════════════════
          SECTION 2: First Jump (12-18s)
          Low obstacle to jump over
          ══════════════════════════════════════════ */}
      <PhysicsBox position={[0, 0.35, -20]} size={[6, 0.7, 1]} color={OBSTACLE} />

      {/* ══════════════════════════════════════════
          SECTION 3: Wider Area (18-32s)
          First tail targets + swing point
          ══════════════════════════════════════════ */}

      {/* Extended road */}
      <PhysicsBox position={[0, -0.25, -45]} size={[12, 0.5, 30]} color={ROAD} />

      {/* Left wall continues */}
      <PhysicsBox position={[-6.5, 1.5, -45]} size={[1, 3, 30]} color={WALL} />
      {/* Right wall continues */}
      <PhysicsBox position={[6.5, 1.5, -45]} size={[1, 3, 30]} color={WALL} />

      {/* Small barrier to tail-yank (dynamic) — §48: 18-25s */}
      <PhysicsBox position={[0, 0.5, -38]} size={[3, 1, 0.5]} color={OBSTACLE} type="dynamic" />

      {/* Swing anchor overhead — §48: 25-32s (garland rope) */}
      <SwingAnchor position={[0, 6, -45]} />
      <SwingAnchor position={[2, 6.5, -50]} />

      {/* Tall posts to hold rope anchors */}
      <PhysicsBox position={[-3, 3, -45]} size={[0.3, 6, 0.3]} color={WALL} />
      <PhysicsBox position={[3, 3, -45]} size={[0.3, 6, 0.3]} color={WALL} />

      {/* ══════════════════════════════════════════
          SECTION 4: Cart Area (32-48s)
          Cart starts rolling → player can hook + surf
          ══════════════════════════════════════════ */}

      {/* Sloped ramp section */}
      <PhysicsBox position={[0, -0.25, -65]} size={[12, 0.5, 10]} color={ROAD} />

      {/* Cart on slope (dynamic, will roll!) */}
      <RigidBody
        type="dynamic"
        position={[0, 0.6, -58]}
        colliders={false}
        mass={8}
        linearDamping={0.3}
        angularDamping={0.5}
      >
        <CuboidCollider args={[0.8, 0.4, 1.2]} />
        <mesh castShadow>
          <boxGeometry args={[1.6, 0.8, 2.4]} />
          <meshStandardMaterial color="#8b5e3c" roughness={0.7} />
        </mesh>
        {/* Cart wheels */}
        <mesh position={[-0.7, -0.35, 0.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[0.7, -0.35, 0.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[-0.7, -0.35, -0.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[0.7, -0.35, -0.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
      </RigidBody>

      {/* Gentle downhill ramp */}
      <RigidBody type="fixed" position={[0, -1.2, -72]} rotation={[0.08, 0, 0]} colliders={false}>
        <CuboidCollider args={[6, 0.25, 8]} />
        <mesh receiveShadow>
          <boxGeometry args={[12, 0.5, 16]} />
          <meshStandardMaterial color={RAMP} roughness={0.85} />
        </mesh>
      </RigidBody>

      {/* More road after ramp */}
      <PhysicsBox position={[0, -2, -88]} size={[12, 0.5, 16]} color={ROAD} />

      {/* Walls along ramp */}
      <PhysicsBox position={[-6.5, 0, -75]} size={[1, 4, 30]} color={WALL} />
      <PhysicsBox position={[6.5, 0, -75]} size={[1, 4, 30]} color={WALL} />

      {/* ══════════════════════════════════════════
          SECTION 5: Landing Zone (48-60s)
          Perfect landing target + tunnel shortcut
          ══════════════════════════════════════════ */}

      {/* Landing platform (slightly raised for PERFECT landing opportunity) */}
      <PhysicsBox position={[0, -1.5, -95]} size={[6, 1, 4]} color={PLATFORM} />

      {/* Continuation road */}
      <PhysicsBox position={[0, -2, -105]} size={[10, 0.5, 16]} color={ROAD} />

      {/* Mouse tunnel shortcut (narrow gap in wall) */}
      <PhysicsBox position={[-5.5, -0.5, -100]} size={[1, 3, 6]} color={WALL} />
      <PhysicsBox position={[-5.5, 1.8, -100]} size={[1, 1, 6]} color={WALL} />
      {/* Gap is between y=-0.5+1.5=1.0 and y=1.8-0.5=1.3 — tight! */}

      {/* Secret tunnel behind wall */}
      <PhysicsBox position={[-8, -1.5, -100]} size={[3, 0.5, 10]} color={TUNNEL} />

      {/* Dynamic objects for physics fun */}
      <PhysicsBox position={[2, 0, -100]} size={[0.5, 0.5, 0.5]} color={CRATE} type="dynamic" />
      <PhysicsBox position={[2.5, 0.5, -100]} size={[0.5, 0.5, 0.5]} color={CRATE} type="dynamic" />
      <PhysicsBox position={[2.2, 1, -100]} size={[0.5, 0.5, 0.5]} color={CRATE} type="dynamic" />

      {/* More swing anchors for Act I exit */}
      <SwingAnchor position={[-2, 5, -108]} />
      <SwingAnchor position={[2, 5.5, -112]} />

      {/* ══════════════════════════════════════════
          SECTION 6: Extended Run (act I tail end)
          ══════════════════════════════════════════ */}
      <PhysicsBox position={[0, -2, -125]} size={[10, 0.5, 24]} color={ROAD} />
      <PhysicsBox position={[-5.5, -0.5, -125]} size={[1, 3, 24]} color={WALL} />
      <PhysicsBox position={[5.5, -0.5, -125]} size={[1, 3, 24]} color={WALL} />

      {/* More obstacles */}
      <PhysicsBox position={[-1.5, -1.2, -118]} size={[2, 1.5, 0.5]} color={OBSTACLE} />
      <PhysicsBox position={[2, -1.2, -125]} size={[1.5, 1.5, 0.5]} color={OBSTACLE} />

      {/* Dynamic barrel */}
      <RigidBody type="dynamic" position={[0, -0.5, -130]} colliders={false} mass={3}>
        <CuboidCollider args={[0.3, 0.4, 0.3]} />
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.35, 0.8, 12]} />
          <meshStandardMaterial color="#7a4a2a" roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Final swing point before act transition */}
      <SwingAnchor position={[0, 7, -135]} />
      <PhysicsBox position={[-3, 2, -135]} size={[0.3, 8, 0.3]} color={WALL} />
      <PhysicsBox position={[3, 2, -135]} size={[0.3, 8, 0.3]} color={WALL} />

      {/* Ledge for clutch save practice */}
      <PhysicsBox position={[5, 1, -132]} size={[2, 0.3, 3]} color={PLATFORM} />
    </group>
  );
}
