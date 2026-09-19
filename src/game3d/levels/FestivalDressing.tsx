import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FestivalPalette } from '../systems/FestivalMaterials';

/**
 * FestivalDressing — PBR marigold / brass / cloth dressing OVER the greybox.
 * Physics untouched (colliders stay in GreyboxLevel). Everything here is
 * visual only: garland ropes, bunting flags, marigold clusters, rangoli,
 * brass lanterns with HDR flames (the only things that bloom).
 */

function MarigoldCluster({
  position,
  count = 7,
  radius = 0.45,
}: {
  position: [number, number, number];
  count?: number;
  radius?: number;
}) {
  const items = useMemo(() => {
    const rng = (seed: number) => {
      const x = Math.sin(seed * 127.1) * 43758.5;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => ({
      offset: [
        (rng(i * 3 + position[0]) - 0.5) * radius * 2,
        rng(i * 5 + position[2]) * 0.25,
        (rng(i * 7 + position[1]) - 0.5) * radius * 2,
      ] as [number, number, number],
      scale: 0.09 + rng(i * 11) * 0.07,
      shade: rng(i * 13) > 0.5 ? FestivalPalette.marigoldBright : FestivalPalette.marigold,
    }));
  }, [count, radius, position]);

  return (
    <group position={position}>
      {/* leaf bed */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <sphereGeometry args={[radius, 10, 8]} />
        <meshStandardMaterial color={FestivalPalette.leafGreen} roughness={0.75} />
      </mesh>
      {items.map((m, i) => (
        <mesh key={i} position={[m.offset[0], 0.12 + m.offset[1], m.offset[2]]} castShadow>
          {/* icosahedron reads as petal ball at play distance, 1 draw each */}
          <icosahedronGeometry args={[m.scale, 1]} />
          <meshStandardMaterial
            color={m.shade}
            roughness={0.55}
            emissive="#3a1500"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function BuntingRow({
  from,
  to,
  sag = 0.9,
  count = 9,
}: {
  from: [number, number, number];
  to: [number, number, number];
  sag?: number;
  count?: number;
}) {
  const flags = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const colors = ['#e8891e', '#c22e6a', '#1e8a8a', '#e8a317', '#a8321f'];
    return Array.from({ length: count }, (_, i) => {
      const t = (i + 0.5) / count;
      const p = a.clone().lerp(b, t);
      p.y -= Math.sin(t * Math.PI) * sag;
      return { pos: p, color: colors[i % colors.length], phase: i * 0.7 };
    });
  }, [from, to, sag, count]);

  return (
    <group>
      {flags.map((f, i) => (
        <BuntingFlag key={i} position={f.pos} color={f.color} phase={f.phase} />
      ))}
    </group>
  );
}

function BuntingFlag({
  position,
  color,
  phase,
}: {
  position: THREE.Vector3;
  color: string;
  phase: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() + phase;
    ref.current.rotation.y = Math.sin(t * 2.2) * 0.35;
    ref.current.rotation.x = Math.sin(t * 3.1) * 0.12;
  });
  return (
    <mesh ref={ref} position={position} castShadow>
      <planeGeometry args={[0.42, 0.55]} />
      <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}

function GarlandArch({ position }: { position: [number, number, number] }) {
  const beads = useMemo(
    () =>
      Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const x = (t - 0.5) * 5.2;
        const y = 4.6 - Math.sin(t * Math.PI) * 0.0 - (1 - Math.sin(t * Math.PI)) * 1.6;
        return { x, y, alt: i % 2 === 0 };
      }),
    []
  );
  return (
    <group position={position}>
      {/* bamboo poles */}
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 2.3, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.11, 4.6, 8]} />
          <meshStandardMaterial color="#6b4a24" roughness={0.8} />
        </mesh>
      ))}
      {/* hanging marigold rope */}
      {beads.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0]} castShadow>
          <icosahedronGeometry args={[b.alt ? 0.16 : 0.12, 1]} />
          <meshStandardMaterial
            color={b.alt ? FestivalPalette.marigoldBright : FestivalPalette.marigold}
            roughness={0.55}
            emissive="#3a1500"
            emissiveIntensity={0.45}
          />
        </mesh>
      ))}
    </group>
  );
}

function RangoliDisc({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ringRef.current) {
      (ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + Math.sin(state.clock.getElapsedTime() * 1.4) * 0.2;
    }
  });
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh receiveShadow>
        <circleGeometry args={[1.4, 32]} />
        <meshStandardMaterial color="#e8d5a8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.9, 1.2, 32]} />
        <meshStandardMaterial
          color={FestivalPalette.rangoliPink}
          roughness={0.6}
          emissive={FestivalPalette.rangoliPink}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, 0.012]}>
        <ringGeometry args={[0.4, 0.7, 24]} />
        <meshStandardMaterial
          color={FestivalPalette.rangoliTeal}
          roughness={0.6}
          emissive={FestivalPalette.rangoliTeal}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0, 0, 0.014]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#ffcf5e"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function FestivalDressing() {
  return (
    <group>
      {/* Welcome gate garland */}
      <GarlandArch position={[0, 0.3, -6]} />
      <GarlandArch position={[0, 0.3, -44]} />

      {/* Bunting across the street */}
      <BuntingRow from={[-4, 4.4, -12]} to={[4, 4.4, -12]} />
      <BuntingRow from={[-6, 5, -40]} to={[6, 5, -40]} />
      <BuntingRow from={[-6, 5, -66]} to={[6, 5, -66]} />

      {/* Marigold beds along walls — warm colour masses for the camera */}
      <MarigoldCluster position={[-3.2, 0.55, -10]} />
      <MarigoldCluster position={[3.2, 0.55, -16]} />
      <MarigoldCluster position={[-5.2, 0.05, -36]} count={9} radius={0.6} />
      <MarigoldCluster position={[5.2, 0.05, -52]} count={9} radius={0.6} />
      <MarigoldCluster position={[-4.6, -1.7, -64]} />
      <MarigoldCluster position={[4.6, -1.7, -84]} />

      {/* Rangoli markers — chapter progress feel */}
      <RangoliDisc position={[0, 0.03, -32]} />
      <RangoliDisc position={[0, -1.68, -96]} />
    </group>
  );
}
