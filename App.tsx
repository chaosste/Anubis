import React, { useState, useRef, useEffect } from 'react';
import { useGeminiLive } from './services/geminiLiveService';
import { userService, fileService } from './services/userService';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import Transcript from './components/Transcript';
import SettingsModal from './components/SettingsModal';
import IntroCard from './components/IntroCard';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import { ConnectionState, AudioSettings, User } from './types';
import { LogIn, LogOut, FileText, FileAudio, MoreVertical } from 'lucide-react';

const AnkhIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2c3 0 5 2.5 5 5.5S14.5 12 12 12s-5-2-5-5.5S9 2 12 2z" />
    <path d="M12 12v10" />
    <path d="M6 15h12" />
  </svg>
);

export const App: React.FC = () => {
  const { 
    connect, 
    disconnect, 
    saveCurrentSession,
    connectionState, 
    volume, 
    transcripts, 
    error,
    recordedBlob 
  } = useGeminiLive();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    voiceName: 'Anubis',
  });
  
  // State to track if user has dismissed the "Login to save" prompt
  const [hasDismissedLoginPrompt, setHasDismissedLoginPrompt] = useState(false);

  // Check auth on load
  useEffect(() => {
    const user = userService.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    userService.logout();
    setCurrentUser(null);
  };

  // Logic to show save options when session ends
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  // Detect disconnect and handle saving/prompts
  useEffect(() => {
    if (connectionState === ConnectionState.DISCONNECTED) {
       // Only trigger if we actually had a conversation
       if (transcripts.length > 0 || recordedBlob) {
           if (currentUser) {
               // Auto-save for logged-in users
               saveCurrentSession(currentUser.username)
                 .then(() => setShowSaveOptions(true))
                 .catch(console.error);
           } else {
               // Show prompt for guests (if not dismissed)
               setShowSaveOptions(true);
           }
       }
    } else if (connectionState === ConnectionState.CONNECTING) {
      setShowSaveOptions(false);
    }
  }, [connectionState, transcripts.length, recordedBlob, currentUser, saveCurrentSession]);

  // Drag-to-scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleConnect = () => {
    connect(audioSettings);
    setShowSaveOptions(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const INTRO_CARDS = [
    {
      id: 1,
      content: (
        <>
          Granular witnessing empowered by <span className="text-indigo-400">microphenomenology</span> interview techniques.
        </>
      )
    },
    {
      id: 2,
      content: (
        <>
          Anubis listens, aiding meaningful integration of <span className="text-indigo-300">anomalous experiences</span>.
        </>
      )
    },
    {
      id: 3,
      content: (
        <>
        Explore the meaning, sensation, accents, atmosphere, shifts and ambiguity of your <span className="text-indigo-400">visionary states</span>. 
        </>
      )
    },
    {
      id: 4,
      content: (
        <>
         Anubis gently encourages <span className="text-indigo-300">scrutiny</span>: memory gathers momentum and vision flows more clearly.
         
        </>
      )
    },
    {
      id: 5,
      content: (
        <>
         Each trip is <span className="text-indigo-400">unique</span>: it can be elusive, ecstatic, bizarre, sombre, adoring, contrary, all at once.
        </>
      )
    },
    {
      id: 6,
      content: (
        <>
         Choose from two guides, psychopomp Anubis or goddess <span className="text-indigo-400">Ishtar</span>.
        </>
      )
    },
    {
      id: 7,
      content: (
        <>
          Experiences are not recorded. You can <button onClick={() => setIsAuthOpen(true)} className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-400 transition-all pointer-events-auto">log in</button> to store them safely on your computer.
        </>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans font-light selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="bg-black/80 border-b border-slate-800 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 pl-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500 hover:text-indigo-400 transition-colors duration-500">
               <AnkhIcon className="w-full h-full" />
            </div>

            {/* Status Section */}
            <div className="flex items-center gap-2">
               {/* Voice Pill */}
               <div className="text-[10px] font-mono text-slate-400/80 bg-slate-900/50 px-2 py-1 rounded-full border border-slate-800 flex items-center gap-1.5">
                  <span className="text-indigo-500/70 hidden sm:inline">VOICE</span>
                  <span className="text-slate-300">{audioSettings.voiceName}</span>
               </div>

               {/* Username Pill */}
               {currentUser && (
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 animate-in fade-in slide-in-from-left-2">
                    <span className="text-white">{currentUser.username}</span>
                 </div>
               )}

               {/* Status Pill */}
               <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border transition-colors duration-200 ${
                  connectionState === ConnectionState.CONNECTED 
                    ? 'bg-green-950/30 text-green-300 border-green-900/50'
                    : connectionState === ConnectionState.CONNECTING
                    ? 'bg-yellow-950/30 text-yellow-300 border-yellow-900/50'
                    : 'bg-slate-900/50 text-slate-500 border-slate-800'
               }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                      connectionState === ConnectionState.CONNECTED ? 'bg-green-400 animate-pulse' :
                      connectionState === ConnectionState.CONNECTING ? 'bg-yellow-400 animate-pulse' :
                      'bg-slate-600'
                  }`} />
                  <span>{connectionState === ConnectionState.DISCONNECTED ? 'OFFLINE' : connectionState}</span>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
             {currentUser ? (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
             ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Login</span>
                </button>
             )}
             
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
               <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-0 sm:px-4 py-6 sm:py-12 flex flex-col items-center w-full">
        
        {/* Intro Gallery */}
        {connectionState === ConnectionState.DISCONNECTED && transcripts.length === 0 && (
          <div className="w-full mb-6 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="px-4 mb-4 sm:mb-6">
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                  Anubis hears you.
                </h2>
             </div>
             
             <div 
               ref={scrollRef}
               onMouseDown={handleMouseDown}
               onMouseLeave={handleMouseLeave}
               onMouseUp={handleMouseUp}
               onMouseMove={handleMouseMove}
               onTouchStart={handleTouchStart}
               onTouchMove={handleTouchMove}
               onTouchEnd={handleTouchEnd}
               style={{ scrollSnapType: isDragging ? 'none' : 'x mandatory' }}
               className={`w-full overflow-x-auto pb-6 pt-2 px-4 flex gap-4 snap-x snap-mandatory no-scrollbar transition-all ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
             >
                {INTRO_CARDS.map((card, index) => (
                  <IntroCard key={card.id} index={index}>
                    {card.content}
                  </IntroCard>
                ))}
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
                    voiceName={audioSettings.voiceName}
                  />
                  
                  {/* Save Session Overlay */}
                  {showSaveOptions && currentUser && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in z-20 rounded-xl">
                      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full text-center">
                        <h3 className="text-xl font-semibold text-white mb-2">Session Archived</h3>
                        <p className="text-slate-400 text-sm mb-6">Your journey has been saved to your history.</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                             onClick={() => fileService.saveTranscript(currentUser.username, transcripts)}
                             className="flex flex-col items-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition-all"
                          >
                             <FileText className="w-6 h-6 text-indigo-400" />
                             <span className="text-xs font-medium">Export Text</span>
                          </button>
                          
                          <button 
                             onClick={() => recordedBlob && fileService.saveAudio(currentUser.username, recordedBlob)}
                             disabled={!recordedBlob}
                             className={`flex flex-col items-center gap-2 p-3 border rounded-xl transition-all ${recordedBlob ? 'bg-slate-800 hover:bg-slate-700 border-slate-600' : 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'}`}
                          >
                             <FileAudio className="w-6 h-6 text-rose-400" />
                             <span className="text-xs font-medium">Export Audio</span>
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => setShowSaveOptions(false)}
                          className="mt-6 text-xs text-slate-500 hover:text-white transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  {showSaveOptions && !currentUser && !hasDismissedLoginPrompt && (
                     <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in z-20 rounded-xl">
                        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full text-center">
                          <p className="text-slate-300 mb-4">Login to save your session recording and transcript to your history.</p>
                          <button 
                            onClick={() => setIsAuthOpen(true)}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-colors"
                          >
                            Login / Signup
                          </button>
                          <button 
                            onClick={() => {
                                setShowSaveOptions(false);
                                setHasDismissedLoginPrompt(true);
                            }}
                            className="block w-full mt-4 text-xs text-slate-500 hover:text-white transition-colors"
                          >
                            Dismiss (Don't show again)
                          </button>
                        </div>
                     </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-0 right-0 flex flex-col items-end sm:flex-row sm:items-center gap-2">
                      <span className="text-[10px] sm:text-xs font-mono text-slate-400/80 backdrop-blur-sm bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
                        16kHz / 16-bit
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
      <footer className="py-6 sm:py-8 text-center text-slate-600 text-xs sm:text-sm flex flex-col items-center gap-2">
        <p>Powered by Gemini Live API</p>
        <a 
          href="https://newpsychonaut.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-indigo-500 hover:text-indigo-400 transition-colors"
        >
          newpsychonaut.com
        </a>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={audioSettings}
        onSettingsChange={setAudioSettings}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={setCurrentUser}
      />

      {/* History Modal */}
      {currentUser && (
        <HistoryModal 
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            username={currentUser.username}
        />
      )}
    </div>
  );
};