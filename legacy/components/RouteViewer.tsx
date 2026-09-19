import React from 'react';
import { useGameStore } from '@/stores/gameStore';

interface RouteViewerProps { onBack: () => void; }

const PATHS: Record<string, string> = {
  'sacred-city-route': 'M 500 910 L 430 830 L 320 780 L 220 680 L 310 590 L 460 610 L 580 540 L 730 480 L 820 380 L 720 290 L 580 340 L 480 260 L 340 300 L 230 210 L 370 130 L 520 190 L 660 120 L 790 200',
  'approach-left': 'M 500 890 L 450 780 L 445 640 L 480 540 L 500 490',
  'approach-right': 'M 500 890 L 550 780 L 555 640 L 520 540 L 500 490',
  shortcut: 'M 500 490 L 390 430 L 270 340 L 130 230',
  safe: 'M 500 490 L 500 360 L 500 220 L 500 70',
  festival: 'M 500 490 L 610 440 L 720 350 L 860 230',
};

const LABELS: Record<string, string> = {
  cart: 'Toppled market cart', diyas: 'Windblown diyas', crowd: 'Crowd knot',
  ambulance: 'Ambulance corridor', power: 'Rain and live wire', dhol: 'Dhol rhythm break',
  'sacred-city-route': 'Vakratunda city path',
  'approach-left': 'Left escape', 'approach-right': 'Right escape',
  shortcut: 'Precision shortcut', safe: 'Safe avenue', festival: 'Festival street',
};

const RouteViewer: React.FC<RouteViewerProps> = ({ onBack }) => {
  const stats = useGameStore((state) => state.currentRunStats);
  const roads = stats.routeRoads || [];

  return (
    <div className="absolute inset-0 bg-deep-shadow/95 p-4 md:p-8 flex flex-col pointer-events-auto font-body z-20 overflow-y-auto">
      <header className="flex justify-between items-center mb-4 md:mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[.28em] text-warm-gold font-bold">Your illuminated journey</span>
          <h2 className="text-2xl md:text-3xl font-bold text-ivory font-display tracking-wider">SEVA CHRONICLE</h2>
        </div>
        <button onClick={onBack} className="px-5 py-2.5 bg-warm-gold text-deep-shadow rounded-xl font-bold text-xs tracking-wider uppercase active:scale-95">BACK TO RESULTS</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_320px] gap-5 flex-1">
        <div className="relative h-[52vh] min-h-[340px] lg:h-auto rounded-2xl overflow-hidden border border-warm-gold/35 shadow-2xl bg-navy">
          <img src="/assets/district-night-v2.png" alt="The festival district at night" className="absolute inset-0 w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050914]/70 via-transparent to-[#050914]/20" />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-label="Glowing route taken">
            <defs><filter id="routeGlow"><feGaussianBlur stdDeviation="10" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
            {roads.map((road) => PATHS[road] && <path key={`${road}-glow`} d={PATHS[road]} fill="none" stroke="#f5a623" strokeWidth="23" opacity=".26" strokeLinecap="round" strokeLinejoin="round" filter="url(#routeGlow)" />)}
            {roads.map((road) => PATHS[road] && <path key={road} d={PATHS[road]} fill="none" stroke="#ffe18a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />)}
          </svg>
          <div className="absolute left-4 bottom-4 rounded-full bg-[#071020]/80 border border-warm-gold/30 px-4 py-2 text-[10px] tracking-[.18em] text-ivory/80">EVERY STREET BEHIND YOU STAYED AWAKE</div>
        </div>

        <aside className="bg-navy/90 border border-warm-gold/30 rounded-2xl p-5 flex flex-col">
          <h3 className="font-display text-lg tracking-wider text-ivory">ROUTE STORY</h3>
          <div className="mt-4 space-y-3 flex-1">
            {roads.map((road, index) => (
              <div key={road} className="flex gap-3 items-center p-3 rounded-xl bg-black/20 border border-ivory/10">
                <span className="w-7 h-7 rounded-full grid place-items-center bg-warm-gold/15 text-warm-gold font-bold text-xs">{index + 1}</span>
                <div><strong className="block text-sm text-ivory">{LABELS[road] || road}</strong><small className="text-ivory/50">Committed by your gesture</small></div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 rounded-xl bg-deep-shadow/70 border border-warm-gold/25 text-center">
            <span className="block text-[9px] tracking-[.2em] text-warm-gold font-bold">OPTIMAL ROUTE</span>
            <strong className="text-lg text-ivory font-mono">???</strong>
            <p className="mt-1 text-[10px] text-ivory/50">Try the other streets. One path is still hiding.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RouteViewer;
