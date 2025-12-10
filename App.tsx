import React, { useState } from 'react';
import { useGeminiLive } from './services/geminiLiveService';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import Transcript from './components/Transcript';
import SettingsModal from './components/SettingsModal';
import Logo from './components/Logo';
import { ConnectionState, AudioSettings } from './types';
import { Sparkles, History, Mic2, Settings } from 'lucide-react';
import { MODEL_NAME } from './constants';

export const App: React.FC = () => {
  const { 
    connect, 
    disconnect, 
    connectionState, 
    volume, 
    transcripts, 
    error 
  } = useGeminiLive();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    sampleRate: 16000,
    bitDepth: 16,
    voiceName: 'Anubis',
    model: MODEL_NAME,
    pitch: 0,
    accent: 'Hampshire Hierophant'
  });

  const handleConnect = () => {
    connect(audioSettings);
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans font-light selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="bg-black/80 border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Component */}
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-lg shadow-white/5">
              <Logo className="w-full h-full" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Anubis
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-4 text-sm text-slate-400 mr-4">
                <span className="flex items-center gap-1"><History size={16}/> Evocation</span>
                <span className="flex items-center gap-1"><Mic2 size={16}/> Investigation</span>
             </div>
             
             <button 
               onClick={() => setIsSettingsOpen(true)}
               disabled={connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING}
               className={`p-2 rounded-full transition-colors ${
                 connectionState === ConnectionState.DISCONNECTED 
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white' 
                  : 'text-slate-600 cursor-not-allowed'
               }`}
               title="Audio Settings"
             >
               <Settings size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
        
        {/* Intro Text (only when disconnected and no history) */}
        {connectionState === ConnectionState.DISCONNECTED && transcripts.length === 0 && (
          <div className="text-left mb-12 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Anubis hears you.
            </h2>
            <div className="text-lg text-slate-400 leading-relaxed space-y-4">
              <p>
                This voice interface uses a granular interview approach from the discipline of <a href="https://www.cell.com/trends/cognitive-sciences/fulltext/S1364-6613(22)00291-1" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">microphenomenology</a>.
              </p>
              <p>
                Anubis listens, hoping to aid the meaningful integration of anomalous experiences.
              </p>
              <p>
                Anubis will encourage you to examine details, to help your memory gather momentum and your vision flow clearly.
              </p>
              <p>
                Each trip is unique: it can be unusual, straightforward, proud, embarrassing, or all of the above, even at the same time.
              </p>
              <p>
                Tone, sensations, sounds, smells, accents, atmosphere, shifts and contradictions can be just as meaningful as visual content.
              </p>
            </div>
          </div>
        )}

        {/* Core Interface */}
        <div className="w-full bg-slate-900 rounded-3xl shadow-2xl shadow-black/50 border border-slate-800 overflow-hidden relative isolate">
           
           <div className="relative z-10 p-8">
             {/* Visualizer Area */}
             <div className="mb-8 relative">
                <Visualizer 
                  volume={volume} 
                  isActive={connectionState === ConnectionState.CONNECTED} 
                />
                
                {/* Status Badge */}
                <div className="absolute top-0 right-0 flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400/80 backdrop-blur-sm bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
                      {audioSettings.sampleRate / 1000}kHz / {audioSettings.bitDepth}-bit
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 backdrop-blur-sm ${
                      connectionState === ConnectionState.CONNECTED 
                        ? 'bg-green-900/40 text-green-300 border border-green-700/50'
                        : connectionState === ConnectionState.CONNECTING
                        ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50'
                        : 'bg-slate-800/40 text-slate-300 border border-slate-700/50'
                    }`}>
                      {connectionState === ConnectionState.CONNECTED && <span className="w-2 h-2 mr-1.5 bg-green-400 rounded-full animate-pulse"></span>}
                      {connectionState}
                    </span>
                </div>
             </div>

             {/* Controls */}
             <Controls 
               connectionState={connectionState}
               onConnect={handleConnect}
               onDisconnect={disconnect}
               error={error}
             />
           </div>
        </div>

        {/* Spacer */}
        <div className="h-16 w-full"></div>

        {/* Live Transcript */}
        <div className="w-full animate-in fade-in duration-1000">
           <div className="flex items-center gap-2 mb-2 px-2">
             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Transcript</span>
             <div className="h-px bg-slate-800 flex-grow"></div>
           </div>
           <Transcript items={transcripts} />
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-600 text-sm">
        <p>Powered by Gemini Live API</p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={audioSettings}
        onSettingsChange={setAudioSettings}
      />
    </div>
  );
};