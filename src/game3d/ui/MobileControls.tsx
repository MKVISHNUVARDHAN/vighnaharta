import React, { useState, useEffect, useRef } from 'react';
import { InputManager } from '../systems/InputManager';

const Joystick: React.FC = () => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const maxRadius = 60; // For a 120px diameter base (128px is w-32/h-32 in tailwind)

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only care about the first touch for the joystick
    const touch = Array.from(e.touches).find(t => t.target === baseRef.current || baseRef.current?.contains(t.target as Node));
    if (touch) updatePosition(touch);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = Array.from(e.touches).find(t => t.target === baseRef.current || baseRef.current?.contains(t.target as Node));
    if (touch) updatePosition(touch);
  };

  const handleTouchEnd = () => {
    setPosition({ x: 0, y: 0 });
    InputManager.getInstance().setJoystick(0, 0);
  };

  const updatePosition = (touch: React.Touch) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setPosition({ x: dx, y: dy });

    const normX = dx / maxRadius;
    const normY = dy / maxRadius;

    InputManager.getInstance().setJoystick(normX, normY);
  };

  return (
    <div
      ref={baseRef}
      className="absolute bottom-8 left-8 w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full border-2 border-white/20 pointer-events-auto touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className="absolute w-12 h-12 bg-white/40 backdrop-blur-md rounded-full left-1/2 top-1/2 -ml-6 -mt-6 pointer-events-none transition-none shadow-lg border border-white/40"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      />
    </div>
  );
};

const ActionButtons: React.FC = () => {
  return (
    <div className="absolute bottom-8 right-8 flex gap-6 pointer-events-auto touch-none">
      <button
        className="w-20 h-20 bg-blue-500/40 backdrop-blur-sm rounded-full border-2 border-cyan-300/50 active:bg-cyan-400/70 active:scale-95 transition-all flex items-center justify-center text-white font-bold select-none shadow-lg"
        onTouchStart={(e) => { e.preventDefault(); InputManager.getInstance().setJumpButton(true); }}
        onTouchEnd={(e) => { e.preventDefault(); InputManager.getInstance().setJumpButton(false); }}
        onTouchCancel={() => InputManager.getInstance().setJumpButton(false)}
      >
        JUMP
      </button>
      <button
        className="w-20 h-20 bg-orange-500/40 backdrop-blur-sm rounded-full border-2 border-orange-300/50 active:bg-orange-400/70 active:scale-95 transition-all flex items-center justify-center text-white font-bold select-none shadow-lg"
        onTouchStart={(e) => { e.preventDefault(); InputManager.getInstance().setTailButton(true); }}
        onTouchEnd={(e) => { e.preventDefault(); InputManager.getInstance().setTailButton(false); }}
        onTouchCancel={() => InputManager.getInstance().setTailButton(false)}
      >
        TAIL
      </button>
    </div>
  );
};

const MuteButton: React.FC = () => {
  const [muted, setMuted] = useState(false);
  
  const toggleMute = () => {
    setMuted(!muted);
    // In a full implementation, we'd call AudioManager.getInstance().setMuted(!muted) here
  };

  return (
    <button
      className="absolute top-4 right-4 w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full border border-white/20 pointer-events-auto flex items-center justify-center text-white text-xs font-bold active:scale-95 transition-all"
      onClick={toggleMute}
      onTouchEnd={(e) => { e.preventDefault(); toggleMute(); }}
    >
      {muted ? 'MUTED' : 'VOL'}
    </button>
  );
};

export const MobileControls: React.FC = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    );
  }, []);

  if (!isTouchDevice) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 pointer-events-none select-none">
      <Joystick />
      <ActionButtons />
      <MuteButton />
    </div>
  );
};
