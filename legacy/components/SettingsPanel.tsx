import React from 'react';
import { useGameStore } from '@/stores/gameStore';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  return (
    <div className="absolute inset-0 bg-deep-shadow/85 backdrop-blur-md flex items-center justify-center z-50 pointer-events-auto p-4 font-body animate-fadeIn">
      <div className="bg-navy border border-warm-gold/40 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
        <h2 className="text-xl md:text-2xl font-bold text-ivory mb-6 text-center font-display tracking-wider">
          SETTINGS & ACCESSIBILITY
        </h2>

        <div className="space-y-5 text-sm">
          {/* Music Volume */}
          <div>
            <div className="flex justify-between text-ivory/80 mb-1.5 font-semibold text-xs uppercase tracking-wider">
              <span>Music Volume</span>
              <span className="font-mono text-warm-gold">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(settings.musicVolume * 100)}
              onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) / 100 })}
              className="w-full accent-warm-gold bg-deep-shadow rounded-lg h-2"
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex justify-between text-ivory/80 mb-1.5 font-semibold text-xs uppercase tracking-wider">
              <span>SFX & Dhol Volume</span>
              <span className="font-mono text-warm-gold">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(settings.sfxVolume * 100)}
              onChange={(e) => updateSettings({ sfxVolume: Number(e.target.value) / 100 })}
              className="w-full accent-warm-gold bg-deep-shadow rounded-lg h-2"
            />
          </div>

          {/* Accessibility Toggles */}
          <div className="pt-2 border-t border-ivory/10 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-ivory/90 font-medium">Mute Audio</span>
              <input
                type="checkbox"
                checked={settings.muted}
                onChange={(e) => updateSettings({ muted: e.target.checked })}
                className="w-5 h-5 accent-marigold rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-ivory/90 font-medium block">Reduced Motion</span>
                <span className="text-[11px] text-ivory/50">Disables intense camera punch and shake</span>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                className="w-5 h-5 accent-marigold rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-ivory/90 font-medium block">High Contrast Visuals</span>
                <span className="text-[11px] text-ivory/50">Enhances road borders and hazard outlines</span>
              </div>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                className="w-5 h-5 accent-marigold rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full py-3 bg-gradient-to-r from-warm-gold to-marigold hover:from-marigold hover:to-warm-gold text-deep-shadow font-extrabold rounded-xl transition-all tracking-wider uppercase text-xs shadow-md active:scale-98"
        >
          SAVE & RETURN
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
