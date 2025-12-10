import React, { useState } from 'react';
import { useGeminiLive } from './services/geminiLiveService';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import Transcript from './components/Transcript';
import SettingsModal from './components/SettingsModal';
import { ConnectionState, AudioSettings } from './types';
import { Sparkles, History, Mic2, Settings, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
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
    bitDepth: 16
  });

  const handleConnect = () => {
    connect(audioSettings);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 bg-opacity-80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Neurophenomenology <span className="text-indigo-600 font-light">Lab</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500 mr-4">
                <span className="flex items-center gap-1"><History size={16}/> Evocation</span>
                <span className="flex items-center gap-1"><Mic2 size={16}/> Investigation</span>
             </div>
             
             <button 
               onClick={() => setIsSettingsOpen(true)}
               disabled={connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING}
               className={`p-2 rounded-full transition-colors ${
                 connectionState === ConnectionState.DISCONNECTED 
                  ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' 
                  : 'text-slate-300 cursor-not-allowed'
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
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
              Mapping the topography of the psychedelic mind.
            </h2>
            <div className="text-lg text-slate-600 leading-relaxed space-y-4">
              <p>
                This voice interface uses <span className="font-semibold text-indigo-600">Neurophenomenology</span> to classify anomalous experiences.
              </p>
              <p>
                Your trip is your own: it can be unusual, straightforward, proud, embarrassing, or all of the above, even at the same time.
              </p>
              <p>
                Tone, sensations, sounds, smells, accents, atmosphere, shifts and contradictions are just as meaningful as visual content.
              </p>
              <p>
                Going into detail can gather momentum and open up your flow.
              </p>
            </div>
          </div>
        )}

        {/* Core Interface */}
        <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-8 mb-8 relative">
           
           {/* Visualizer Area */}
           <div className="mb-8 relative">
              <Visualizer 
                volume={volume} 
                isActive={connectionState === ConnectionState.CONNECTED} 
              />
              
              {/* Status Badge */}
              <div className="absolute top-0 right-0 flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-300">
                    {audioSettings.sampleRate / 1000}kHz / {audioSettings.bitDepth}-bit
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                    connectionState === ConnectionState.CONNECTED 
                      ? 'bg-green-100 text-green-800'
                      : connectionState === ConnectionState.CONNECTING
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {connectionState === ConnectionState.CONNECTED && <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full animate-pulse"></span>}
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

        {/* Live Transcript */}
        <div className="w-full animate-in fade-in duration-1000">
           <div className="flex items-center gap-2 mb-2 px-2">
             <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Transcript</span>
             <div className="h-px bg-slate-200 flex-grow"></div>
           </div>
           <Transcript items={transcripts} />
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm">
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

export default App;