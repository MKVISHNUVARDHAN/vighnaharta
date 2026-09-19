import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { SharedState } from '@/game3d/systems/SharedState';

const MAX_PARTICLES = 200;

export function ParticleEffects() {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Use dust texture for foot dust and impact, use light texture for speed streaks
  const dustTex = useLoader(THREE.TextureLoader, '/assets/kenney/smoke-particles/PNG/White puff/puff00.png');

  // We will build a custom shader material to support per-particle size and alpha
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: dustTex }
      },
      vertexShader: `
        attribute float size;
        attribute float alpha;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = color;
          vAlpha = alpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z); // Size attenuation
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 texColor = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor * texColor.rgb, texColor.a * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
  }, [dustTex]);

  const particleData = useMemo(() => {
    return {
      positions: new Float32Array(MAX_PARTICLES * 3).fill(9999),
      velocities: new Float32Array(MAX_PARTICLES * 3),
      sizes: new Float32Array(MAX_PARTICLES),
      ages: new Float32Array(MAX_PARTICLES).fill(999),
      lifetimes: new Float32Array(MAX_PARTICLES),
      colors: new Float32Array(MAX_PARTICLES * 3),
      alphas: new Float32Array(MAX_PARTICLES)
    };
  }, []);

  const spawnTimer = useRef(0);
  const prevGrounded = useRef(true);

  const spawnParticle = (pos: THREE.Vector3, vel: THREE.Vector3, size: number, lifetime: number, color: THREE.Color) => {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (particleData.ages[i] >= particleData.lifetimes[i]) {
        particleData.positions[i * 3] = pos.x;
        particleData.positions[i * 3 + 1] = pos.y;
        particleData.positions[i * 3 + 2] = pos.z;
        
        particleData.velocities[i * 3] = vel.x;
        particleData.velocities[i * 3 + 1] = vel.y;
        particleData.velocities[i * 3 + 2] = vel.z;
        
        particleData.sizes[i] = size;
        particleData.ages[i] = 0;
        particleData.lifetimes[i] = lifetime;
        
        particleData.colors[i * 3] = color.r;
        particleData.colors[i * 3 + 1] = color.g;
        particleData.colors[i * 3 + 2] = color.b;
        
        particleData.alphas[i] = 1;
        break;
      }
    }
  };

  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempVel = useMemo(() => new THREE.Vector3(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    // Foot Dust
    if (SharedState.mooshakGrounded && SharedState.mooshakSpeed > 2) {
      spawnTimer.current += delta;
      if (spawnTimer.current > 0.15) {
        spawnTimer.current = 0;
        tempPos.set(SharedState.mooshakPos.x, SharedState.mooshakPos.y, SharedState.mooshakPos.z);
        tempPos.x += (Math.random() - 0.5) * 0.5;
        tempPos.z += (Math.random() - 0.5) * 0.5;
        
        tempVel.set((Math.random() - 0.5) * 1, Math.random() * 2 + 1, (Math.random() - 0.5) * 1);
        tempColor.set('#c4956a');
        spawnParticle(tempPos, tempVel, Math.random() * 5 + 5, 0.5, tempColor);
      }
    }

    // Landing Impact
    if (SharedState.mooshakGrounded && !prevGrounded.current) {
      const count = Math.min(16, Math.max(8, Math.floor(SharedState.mooshakSpeed)));
      tempPos.set(SharedState.mooshakPos.x, SharedState.mooshakPos.y, SharedState.mooshakPos.z);
      tempColor.set(SharedState.mooshakSpeed > 15 ? '#ffd36a' : '#c4956a');
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        tempVel.set(Math.cos(angle) * 5, Math.random() * 2 + 1, Math.sin(angle) * 5);
        spawnParticle(tempPos, tempVel, Math.random() * 8 + 6, 0.6, tempColor);
      }
    }
    prevGrounded.current = SharedState.mooshakGrounded;

    // Speed Lines
    if (SharedState.mooshakSpeed > 10) {
      if (Math.random() > 0.5) {
        tempPos.set(
          SharedState.mooshakPos.x + (Math.random() - 0.5) * 4,
          SharedState.mooshakPos.y + Math.random() * 3,
          SharedState.mooshakPos.z + (Math.random() - 0.5) * 4
        );
        tempVel.set(0, 0, -SharedState.mooshakSpeed * 2);
        tempColor.set('#ffffff');
        spawnParticle(tempPos, tempVel, 3, 0.2, tempColor);
      }
    }

    // Update Particles
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const alphas = pointsRef.current.geometry.attributes.alpha.array as Float32Array;
    const colors = pointsRef.current.geometry.attributes.color.array as Float32Array;
    const sizes = pointsRef.current.geometry.attributes.size.array as Float32Array;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (particleData.ages[i] < particleData.lifetimes[i]) {
        particleData.ages[i] += delta;
        
        particleData.positions[i * 3] += particleData.velocities[i * 3] * delta;
        particleData.positions[i * 3 + 1] += particleData.velocities[i * 3 + 1] * delta;
        particleData.positions[i * 3 + 2] += particleData.velocities[i * 3 + 2] * delta;
        
        positions[i * 3] = particleData.positions[i * 3];
        positions[i * 3 + 1] = particleData.positions[i * 3 + 1];
        positions[i * 3 + 2] = particleData.positions[i * 3 + 2];
        
        const lifeRatio = particleData.ages[i] / particleData.lifetimes[i];
        particleData.alphas[i] = 1 - lifeRatio;
        
        alphas[i] = particleData.alphas[i];
        colors[i * 3] = particleData.colors[i * 3];
        colors[i * 3 + 1] = particleData.colors[i * 3 + 1];
        colors[i * 3 + 2] = particleData.colors[i * 3 + 2];
        sizes[i] = particleData.sizes[i] * (1 - lifeRatio * 0.2);
      } else {
        positions[i * 3] = 9999;
        positions[i * 3 + 1] = 9999;
        positions[i * 3 + 2] = 9999;
        alphas[i] = 0;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.alpha.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;
    pointsRef.current.geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={MAX_PARTICLES} array={particleData.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={MAX_PARTICLES} array={particleData.colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={MAX_PARTICLES} array={particleData.sizes} itemSize={1} />
        <bufferAttribute attach="attributes-alpha" count={MAX_PARTICLES} array={particleData.alphas} itemSize={1} />
      </bufferGeometry>
    </points>
  );
}
