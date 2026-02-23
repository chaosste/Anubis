import React, { useState, useEffect } from 'react';
import { useGeminiLive } from './services/geminiLiveService';
import { userService } from './services/userService';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';
import Transcript from './components/Transcript';
import SettingsModal from './components/SettingsModal';
import IntroGallery from './components/IntroGallery';
import AuthModal from './components/AuthModal';
import HistoryModal from './components/HistoryModal';
import SaveSessionOverlay from './components/SaveSessionOverlay';
import { AnkhIcon } from './components/Icons';
import { ConnectionState, AudioSettings, User } from './types';
import { LogIn, LogOut, MoreVertical } from 'lucide-react';

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
  
  // Lazy initialization ensures we read from localStorage immediately on first render
  // effectively persisting the login state across refreshes.
  const [currentUser, setCurrentUser] = useState<User | null>(() => userService.getCurrentUser());
  
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    voiceName: 'Anubis',
    increasedSensitivityMode: false,
  });
  
  const [hasDismissedLoginPrompt, setHasDismissedLoginPrompt] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    userService.logout();
    setCurrentUser(null);
  };

  useEffect(() => {
    if (connectionState === ConnectionState.DISCONNECTED) {
       if (transcripts.length > 0 || recordedBlob) {
           if (currentUser) {
               saveCurrentSession(currentUser.username)
                 .then(() => setShowSaveOptions(true))
                 .catch(console.error);
           } else {
               setShowSaveOptions(true);
           }
       }
    } else if (connectionState === ConnectionState.CONNECTING) {
      setShowSaveOptions(false);
    }
  }, [connectionState, transcripts.length, recordedBlob, currentUser, saveCurrentSession]);

  const handleConnect = () => {
    connect(audioSettings);
    setShowSaveOptions(false);
  };

  const hasUserSpoken = transcripts.some(t => t.role === 'user');

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

      <main className="max-w-6xl mx-auto px-0 sm:px-4 pt-4 pb-6 sm:py-12 flex flex-col items-center w-full">
        
        {/* Intro Gallery */}
        {connectionState === ConnectionState.DISCONNECTED && transcripts.length === 0 && (
            <IntroGallery onLoginClick={() => setIsAuthOpen(true)} />
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
                  {showSaveOptions && (
                      <SaveSessionOverlay 
                        currentUser={currentUser}
                        transcripts={transcripts}
                        recordedBlob={recordedBlob}
                        onClose={() => setShowSaveOptions(false)}
                        onLoginClick={() => setIsAuthOpen(true)}
                        onDismissLogin={() => {
                            setShowSaveOptions(false);
                            setHasDismissedLoginPrompt(true);
                        }}
                        hasDismissedLogin={hasDismissedLoginPrompt}
                      />
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
                hasUserSpoken={hasUserSpoken}
              />
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="h-4 sm:h-16 w-full"></div>

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
        currentUser={currentUser}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
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
