import React from 'react';
import { FileText, FileAudio } from 'lucide-react';
import { User, TranscriptionItem } from '../types';
import { fileService } from '../services/userService';

interface SaveSessionOverlayProps {
    currentUser: User | null;
    transcripts: TranscriptionItem[];
    recordedBlob: Blob | null;
    onClose: () => void;
    onLoginClick: () => void;
    onDismissLogin: () => void;
    hasDismissedLogin: boolean;
}

const SaveSessionOverlay: React.FC<SaveSessionOverlayProps> = ({
    currentUser,
    transcripts,
    recordedBlob,
    onClose,
    onLoginClick,
    onDismissLogin,
    hasDismissedLogin
}) => {
    if (currentUser) {
        return (
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
                    onClick={onClose}
                    className="mt-6 text-xs text-slate-500 hover:text-white transition-colors"
                >
                    Close
                </button>
                </div>
            </div>
        );
    }

    if (!hasDismissedLogin) {
        return (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in z-20 rounded-xl">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl max-w-sm w-full text-center">
                    <p className="text-slate-300 mb-4">Login to save your session recording and transcript to your history.</p>
                    <button 
                    onClick={onLoginClick}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-colors"
                    >
                    Login / Signup
                    </button>
                    <button 
                    onClick={() => {
                        onClose();
                        onDismissLogin();
                    }}
                    className="block w-full mt-4 text-xs text-slate-500 hover:text-white transition-colors"
                    >
                    Dismiss (Don't show again)
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default SaveSessionOverlay;