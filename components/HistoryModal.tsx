import React, { useEffect, useState, useRef } from 'react';
import { X, Calendar, Play, Download, Trash2, FileText, FileAudio } from 'lucide-react';
import { StoredSession } from '../types';
import { userService, fileService } from '../services/userService';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, username }) => {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StoredSession | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && username) {
      setLoading(true);
      userService.getUserSessions(username)
        .then(setSessions)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, username]);

  useEffect(() => {
    if (selectedSession?.audioBlob) {
        const url = URL.createObjectURL(selectedSession.audioBlob);
        setAudioUrl(url);
        return () => URL.revokeObjectURL(url);
    } else {
        setAudioUrl(null);
    }
  }, [selectedSession]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session?')) {
        await userService.deleteSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
        if (selectedSession?.id === id) setSelectedSession(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-4xl h-[80vh] flex overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Sidebar List */}
        <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/50">
           <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-indigo-400" />
                 History
              </h3>
           </div>
           
           <div className="flex-grow overflow-y-auto no-scrollbar">
              {loading ? (
                  <div className="p-4 text-slate-500 text-sm text-center">Loading archives...</div>
              ) : sessions.length === 0 ? (
                  <div className="p-8 text-slate-600 text-sm text-center">No recorded sessions found.</div>
              ) : (
                  sessions.map(session => (
                      <div 
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`p-4 border-b border-slate-800/50 cursor-pointer transition-colors hover:bg-slate-800/50 ${selectedSession?.id === session.id ? 'bg-indigo-900/20 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'}`}
                      >
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-slate-200 text-sm font-medium">
                                {new Date(session.timestamp).toLocaleDateString()}
                            </span>
                            <button 
                                onClick={(e) => handleDelete(e, session.id)}
                                className="text-slate-600 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                         <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>{new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {session.audioBlob && <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">Audio</span>}
                         </div>
                         <div className="mt-2 text-xs text-slate-400 line-clamp-2 italic">
                            {session.transcripts.find(t => t.role === 'user')?.text || "No user speech detected"}
                         </div>
                      </div>
                  ))
              )}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-slate-900 relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors z-10"
            >
                <X className="w-5 h-5" />
            </button>

            {selectedSession ? (
                <>
                    {/* Header Actions */}
                    <div className="p-6 border-b border-slate-800 flex items-center gap-4 mt-8 sm:mt-0">
                        {audioUrl ? (
                            <audio 
                                ref={audioRef}
                                controls 
                                src={audioUrl} 
                                className="flex-grow h-10 w-full rounded-lg" 
                            />
                        ) : (
                            <div className="flex-grow p-2 bg-slate-800/50 rounded text-center text-xs text-slate-500">
                                Audio not available for this session
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => fileService.saveTranscript(username, selectedSession.transcripts)}
                                className="p-2 text-indigo-400 hover:bg-indigo-900/30 rounded-lg transition-colors"
                                title="Download Transcript"
                            >
                                <FileText className="w-5 h-5" />
                            </button>
                            {selectedSession.audioBlob && (
                                <button 
                                    onClick={() => fileService.saveAudio(username, selectedSession.audioBlob!)}
                                    className="p-2 text-rose-400 hover:bg-rose-900/30 rounded-lg transition-colors"
                                    title="Download Audio"
                                >
                                    <FileAudio className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Transcript View */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
                        {selectedSession.transcripts.map((t, idx) => (
                            <div key={idx} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                                    t.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-br-none' 
                                        : 'bg-slate-800 text-slate-300 rounded-bl-none'
                                }`}>
                                    <span className="block text-[10px] opacity-50 mb-1 uppercase tracking-wider font-bold">
                                        {t.role}
                                    </span>
                                    {t.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-600">
                    <Calendar className="w-12 h-12 mb-4 opacity-20" />
                    <p>Select a session to view details</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default HistoryModal;