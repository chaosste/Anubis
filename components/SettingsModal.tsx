import React from 'react';
import { X, Settings2, Mic, ChevronDown, History, UserPlus, Shield } from 'lucide-react';
import { AudioSettings, User } from '../types';
import { VOICES } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  onSettingsChange: (settings: AudioSettings) => void;
  onOpenAuth: () => void;
  onOpenHistory: () => void;
  currentUser: User | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange,
  onOpenAuth,
  onOpenHistory,
  currentUser
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 sm:items-center sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden animate-in slide-in-from-top-8 sm:zoom-in-95 duration-200 flex flex-col">
        
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-900/30 rounded-lg">
                <Settings2 className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-grow custom-scrollbar">

          {/* Account Actions */}
          <div className="space-y-3">
             <label className="block text-sm font-medium text-slate-400">
              Account
            </label>
            {currentUser ? (
                 <button 
                   onClick={() => {
                       onOpenHistory();
                       onClose();
                   }}
                   className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors group"
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                            <History className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <div className="text-white font-medium text-sm">View Session History</div>
                            <div className="text-slate-500 text-xs">Access past transcripts and audio</div>
                        </div>
                    </div>
                 </button>
            ) : (
                 <button 
                   onClick={() => {
                       onOpenAuth();
                       onClose();
                   }}
                   className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors group"
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <div className="text-white font-medium text-sm">Create Account</div>
                            <div className="text-slate-500 text-xs">Save your sessions locally</div>
                        </div>
                    </div>
                 </button>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* Voice Selection */}
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">
              Voice Persona
            </label>
            <div className="relative group">
              <select
                value={settings.voiceName}
                onChange={(e) => onSettingsChange({ ...settings, voiceName: e.target.value })}
                className="peer w-full appearance-none p-3 pl-10 pr-10 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 font-medium hover:border-slate-600 focus:shadow-lg focus:shadow-indigo-500/10 text-sm sm:text-base"
              >
                {Object.values(VOICES).map((voice) => (
                  <option key={voice.id} value={voice.id} className="bg-slate-900">
                    {voice.name}
                  </option>
                ))}
              </select>
              <Mic className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors duration-300 peer-focus:text-indigo-400 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-transform duration-300 peer-focus:rotate-180 peer-focus:text-indigo-400 pointer-events-none" />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">
              Ethical Contract
            </label>
            <button
              onClick={() => onSettingsChange({ ...settings, increasedSensitivityMode: !settings.increasedSensitivityMode })}
              className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium text-sm">Increased Sensitivity Mode</div>
                  <div className="text-slate-500 text-xs">Slower pacing and gentler probing</div>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${settings.increasedSensitivityMode ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {settings.increasedSensitivityMode ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
          
          <div className="text-xs text-slate-500 italic mt-2">
             Anubis uses high-fidelity 16kHz audio input and 16-bit PCM depth for optimal voice analysis.
          </div>

        </div>

        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 flex justify-end flex-shrink-0">
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
