import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progressive illumination of sacred rangoli
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          clearInterval(interval);
          setLoaded(true);
          return 1;
        }
        return Math.min(1, p + 0.08);
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const handleTap = () => {
    if (loaded) {
      // AudioContext unlock attempt
      try {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      } catch {
        // Safe ignore
      }
      onComplete();
    }
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div
      className="absolute inset-0 bg-deep-shadow flex flex-col items-center justify-center cursor-pointer p-6 select-none font-body overflow-hidden"
      onClick={handleTap}
    >
      {/* Background ambient lighting aura */}
      <div className="absolute w-96 h-96 bg-marigold/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Rangoli Geometric Mandala Loader */}
      <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          {/* Subtle background track */}
          <circle
            cx="70"
            cy="70"
            r="54"
            fill="none"
            stroke="#1a1a3e"
            strokeWidth="3"
          />
          {/* Progressively illuminating outer lotus circle */}
          <circle
            cx="70"
            cy="70"
            r="54"
            fill="none"
            stroke="url(#mandalaGold)"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-150"
          />

          {/* Internal Rangoli Flower Petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const petalOpacity = progress > i / 8 ? 1 : 0.15;
            return (
              <g key={angle} transform={`rotate(${angle} 70 70)`}>
                <path
                  d="M70,70 Q70,40 60,30 Q70,20 80,30 Q70,40 70,70"
                  fill={progress > i / 8 ? '#d4a53c' : 'none'}
                  fillOpacity="0.4"
                  stroke={progress > i / 8 ? '#ffd700' : '#2d6a6a'}
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                  opacity={petalOpacity}
                />
              </g>
            );
          })}

          <defs>
            <linearGradient id="mandalaGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#e8a317" />
              <stop offset="100%" stopColor="#e85d26" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Diya Flame */}
        <div className="absolute flex flex-col items-center">
          <div
            className={`w-4 h-6 rounded-full bg-gradient-to-t from-festival-orange via-marigold to-ivory transition-all duration-500 ${
              loaded ? 'scale-125 shadow-[0_0_20px_#e8a317] animate-bounce' : 'scale-90'
            }`}
          />
          <div className="w-5 h-2 bg-warm-gold rounded-full mt-0.5" />
        </div>
      </div>

      {/* Main Game Title */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-warm-gold via-marigold to-ivory tracking-widest font-display text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
        VIGHNAHARTA
      </h1>
      <h2 className="text-sm md:text-lg text-ivory/80 tracking-[0.35em] mt-1.5 font-display text-center uppercase">
        PATH OF LIGHT
      </h2>

      {/* Loading Percentage & Status */}
      <div className="mt-8 flex flex-col items-center">
        <span className="text-xs font-mono text-warm-gold tracking-widest">
          {loaded ? '100%' : `${Math.round(progress * 100)}%`}
        </span>
        <span className="text-xs text-ivory/60 tracking-wider mt-1">
          {loaded ? 'Ganesh Chaturthi Procession Ready' : 'Illuminating sacred city routes...'}
        </span>
      </div>

      {/* Tap to Start Action */}
      {loaded && (
        <div className="mt-8 px-8 py-3 rounded-full bg-warm-gold/20 border border-warm-gold text-warm-gold font-bold text-sm md:text-base tracking-widest uppercase animate-pulse shadow-[0_0_20px_rgba(212,165,60,0.3)]">
          Tap to Enter the City
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;
