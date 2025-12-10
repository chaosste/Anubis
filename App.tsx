import React, { useState } from 'react';
import { useGeminiLive } from './services/geminiLiveService';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import Transcript from './components/Transcript';
import SettingsModal from './components/SettingsModal';
import IntroCard from './components/IntroCard';
import Logo from './components/Logo';
import { ConnectionState, AudioSettings } from './types';
import { History, Mic2, Settings } from 'lucide-react';
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

  // Configuration for Intro Cards
  // TODO: Replace these placeholder URLs with the actual paths to your uploaded images.
  const INTRO_CARDS = [
    {
      id: 1,
      // Image: Green/Blue entwined figures
      image: "images/a1.jpeg", 
      content: (
        <>
          This voice interface uses a granular interview approach from the discipline of <span className="text-indigo-400">microphenomenology</span>.
        </>
      )
    },
    {
      id: 2,
      // Image: Pop Art Panther
      image: "https://placehold.co/800x1000/0f172a/6366f1?text=Replace+with+Panther+Art", 
      content: (
        <>
          Anubis listens, hoping to aid the meaningful integration of <span className="text-indigo-300">anomalous experiences</span>.
        </>
      )
    },
    {
      id: 3,
      // Image: Woman with Turtles
      image: "https://placehold.co/800x1000/0f172a/6366f1?text=Replace+with+Woman+Turtles+Art",
      content: (
        <>
          Anubis will encourage you to examine details, to help your memory gather momentum and your vision flow clearly.
        </>
      )
    },
    {
      id: 4,
      // Image: Complex Shamanic Vision
      image: "https://placehold.co/800x1000/0f172a/6366f1?text=Replace+with+Shamanic+Vision+Art",
      content: (
        <>
          Each trip is unique: it can be unusual, straightforward, proud, embarrassing, or all of the above.
        </>
      )
    },
    {
      id: 5,
      // No Image - Gradient Fallback
      image: undefined, 
      content: (
        <>
          Tone, sensations, sounds, smells, accents, atmosphere, shifts and contradictions can be just as meaningful as visual content.
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans font-light selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="bg-black/80 border-b border-slate-800 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Logo Component */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center p-1 sm:p-1.5 shadow-lg shadow-white/5">
              <Logo className="w-full h-full" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Anubis
            </h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
             <div className="hidden sm:flex items-center gap-4 text-sm text-slate-400 mr-2 sm:mr-4">
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
               <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-0 sm:px-4 py-6 sm:py-12 flex flex-col items-center w-full">
        
        {/* Intro Gallery (only when disconnected and no history) */}
        {connectionState === ConnectionState.DISCONNECTED && transcripts.length === 0 && (
          <div className="w-full mb-8 sm:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="px-4 mb-4 sm:mb-6">
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  Anubis hears you.
                </h2>
             </div>
             
             {/* Horizontal Scroll Gallery */}
             <div className="w-full overflow-x-auto pb-6 pt-2 px-4 flex gap-4 snap-x snap-mandatory no-scrollbar">
                
                {INTRO_CARDS.map((card, index) => (
                  <IntroCard key={card.id} index={index} image={card.image}>
                    {card.content}
                  </IntroCard>
                ))}

                {/* Spacer for right padding scroll */}
                <div className="w-1 flex-none" />
             </div>
          </div>
        )}

        {/* Core Interface */}
        <div className="w-full max-w-4xl px-3 sm:px-0">
          <div className="w-full bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 border border-slate-800 overflow-hidden relative isolate transition-all">
            
            <div className="relative z-10 p-4 sm:p-8">
              {/* Visualizer Area */}
              <div className="mb-6 sm:mb-8 relative">
                  <Visualizer 
                    volume={volume} 
                    isActive={connectionState === ConnectionState.CONNECTED} 
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-0 right-0 flex flex-col items-end sm:flex-row sm:items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-mono text-slate-400/80 backdrop-blur-sm bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
                        {audioSettings.sampleRate / 1000}kHz / {audioSettings.bitDepth}-bit
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-medium transition-colors duration-200 backdrop-blur-sm ${
                        connectionState === ConnectionState.CONNECTED 
                          ? 'bg-green-900/40 text-green-300 border border-green-700/50'
                          : connectionState === ConnectionState.CONNECTING
                          ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50'
                          : 'bg-slate-800/40 text-slate-300 border border-slate-700/50'
                      }`}>
                        {connectionState === ConnectionState.CONNECTED && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 mr-1.5 bg-green-400 rounded-full animate-pulse"></span>}
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
        </div>

        {/* Spacer */}
        <div className="h-8 sm:h-16 w-full"></div>

        {/* Live Transcript */}
        <div className="w-full max-w-4xl px-3 sm:px-0 animate-in fade-in duration-1000">
           <div className="flex items-center gap-2 mb-2 px-2">
             <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Transcript</span>
             <div className="h-px bg-slate-800 flex-grow"></div>
           </div>
           <Transcript items={transcripts} />
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 sm:py-8 text-center text-slate-600 text-xs sm:text-sm">
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