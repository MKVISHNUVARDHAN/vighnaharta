import type { Vec2 } from '@/types/game';

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

export function criticallyDampedSpring(
  current: number,
  target: number,
  velocity: number,
  omega: number,
  dt: number
): { value: number; velocity: number } {
  const f = 1.0 + omega * dt;
  const hoo = dt / (f * f);
  const hhoo = dt * hoo;
  const f1 = (velocity + omega * (current - target)) * hhoo;
  const f2 = (current - target) * (1.0 / f) + f1;
  return {
    value: f2 + target,
    velocity: velocity * (1.0 / (f * f)) - (current - target) * (omega * omega * hoo)
  };
}

export function isoToScreen(gridX: number, gridY: number, tileWidth: number, tileHeight: number): Vec2 {
  return {
    x: (gridX - gridY) * (tileWidth / 2),
    y: (gridX + gridY) * (tileHeight / 2)
  };
}

export function screenToIso(screenX: number, screenY: number, tileWidth: number, tileHeight: number): Vec2 {
  return {
    x: (screenX / (tileWidth / 2) + screenY / (tileHeight / 2)) / 2,
    y: (screenY / (tileHeight / 2) - screenX / (tileWidth / 2)) / 2
  };
}

export function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function angleBetween(a: Vec2, b: Vec2): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}
