import React from 'react';
import { X, Settings2 } from 'lucide-react';
import { AudioSettings } from '../types';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
                <Settings2 className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Audio Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Sample Rate */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Input Sample Rate
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[16000, 24000].map((rate) => (
                <button
                  key={rate}
                  onClick={() => onSettingsChange({ ...settings, sampleRate: rate })}
                  className={`flex flex-col items-center p-3 border-2 rounded-xl transition-all ${
                    settings.sampleRate === rate
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
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
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bit Depth
            </label>
            <select
              value={settings.bitDepth}
              onChange={(e) => onSettingsChange({ ...settings, bitDepth: Number(e.target.value) })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value={16}>16-bit PCM (Standard)</option>
              {/* Future proofing UI, though only 16-bit is implemented in backend logic for now */}
              <option value={16} disabled>24-bit (Not supported)</option>
              <option value={16} disabled>32-bit Float (Not supported)</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">
              The application currently uses 16-bit PCM for optimal compatibility.
            </p>
          </div>

        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
