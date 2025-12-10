import React from 'react';
import { X, Settings2, Mic, ChevronDown, Zap, Sparkles } from 'lucide-react';
import { AudioSettings } from '../types';
import { MODEL_NAME, FAST_MODEL_NAME } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onSettingsChange: (settings: AudioSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}) => {
  if (!isOpen) return null;

  const voices = [
    { id: 'Fenrir', name: 'Fenrir', desc: 'Deep & Resonant' },
    { id: 'Charon', name: 'Charon', desc: 'Steady & Calm' },
    { id: 'Vindemiatrix', name: 'Vindemiatrix', desc: 'Mystical & Clear' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-900/30 rounded-lg">
                <Settings2 className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Audio Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Voice Selection */}
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">
              Voice Persona
            </label>
            <div className="relative">
              <select
                value={settings.voiceName}
                onChange={(e) => onSettingsChange({ ...settings, voiceName: e.target.value })}
                className="w-full appearance-none p-3 pl-10 pr-10 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
              >
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id} className="bg-slate-900">
                    {voice.name} — {voice.desc}
                  </option>
                ))}
              </select>
              <Mic className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Response Speed
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSettingsChange({ ...settings, model: MODEL_NAME })}
                className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all gap-1 ${
                  settings.model === MODEL_NAME
                    ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300'
                    : 'border-slate-700 hover:border-slate-600 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} />
                  <span className="font-semibold text-sm">Standard</span>
                </div>
                <span className="text-[10px] opacity-75">High Quality</span>
              </button>

              <button
                onClick={() => onSettingsChange({ ...settings, model: FAST_MODEL_NAME })}
                className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all gap-1 ${
                  settings.model === FAST_MODEL_NAME
                    ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300'
                    : 'border-slate-700 hover:border-slate-600 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Zap size={16} />
                  <span className="font-semibold text-sm">Fast</span>
                </div>
                <span className="text-[10px] opacity-75">Flash Lite</span>
              </button>
            </div>
          </div>
          
          <div className="h-px bg-slate-800" />

          {/* Sample Rate */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Input Sample Rate
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[16000, 24000].map((rate) => (
                <button
                  key={rate}
                  onClick={() => onSettingsChange({ ...settings, sampleRate: rate })}
                  className={`flex flex-col items-center p-3 border-2 rounded-xl transition-all ${
                    settings.sampleRate === rate
                      ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300'
                      : 'border-slate-700 hover:border-slate-600 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-semibold">{rate / 1000} kHz</span>
                  <span className="text-xs opacity-75">
                    {rate === 16000 ? 'Standard' : 'High Quality'}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Higher sample rates may improve audio clarity but require more bandwidth.
            </p>
          </div>

          {/* Bit Depth */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Bit Depth
            </label>
            <div className="relative">
                <select
                value={settings.bitDepth}
                onChange={(e) => onSettingsChange({ ...settings, bitDepth: Number(e.target.value) })}
                className="w-full appearance-none p-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                <option value={16}>16-bit PCM (Standard)</option>
                <option value={16} disabled>24-bit (Not supported)</option>
                <option value={16} disabled>32-bit Float (Not supported)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            </div>
          </div>

        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;