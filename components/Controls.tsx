import React from 'react';
import { Mic, Square, AlertCircle, Headphones } from 'lucide-react';
import { ConnectionState } from '../types';

interface ControlsProps {
  connectionState: ConnectionState;
  onConnect: () => void;
  onDisconnect: () => void;
  error: string | null;
}

const Controls: React.FC<ControlsProps> = ({ connectionState, onConnect, onDisconnect, error }) => {
  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-red-900/20 rounded-lg border border-red-800 w-full">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-red-400 text-center text-sm">{error}</p>
        <button
          onClick={onConnect}
          className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm w-full sm:w-auto"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {connectionState === ConnectionState.DISCONNECTED ? (
        <div className="text-center w-full">
            <button
                onClick={onConnect}
                className="group relative inline-flex items-center justify-center p-4 px-6 sm:px-8 py-3 sm:py-4 overflow-hidden font-medium text-indigo-400 transition duration-300 ease-out border-2 border-indigo-500 rounded-full shadow-md hover:bg-indigo-600 hover:text-white w-full sm:w-auto"
            >
                <span className="absolute inset-0 flex items-center justify-center w-full h-full text-white duration-300 -translate-x-full bg-indigo-600 group-hover:translate-x-0 ease">
                    <Mic className="w-6 h-6" />
                </span>
                <span className="absolute flex items-center justify-center w-full h-full text-indigo-400 transition-all duration-300 transform group-hover:translate-x-full ease">
                    Begin Interview
                </span>
                <span className="relative invisible">Begin Interview</span>
            </button>
            <p className="mt-4 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                Please use headphones for the best experience.
            </p>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <button
            onClick={onDisconnect}
            disabled={isConnecting}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isConnecting 
                ? 'bg-slate-700 cursor-wait' 
                : 'bg-rose-600 hover:bg-rose-700 shadow-lg hover:shadow-rose-900/50 hover:scale-105'
            }`}
          >
            {isConnecting ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-slate-400 border-t-slate-200 rounded-full animate-spin" />
            ) : (
              <Square className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-current" />
            )}
          </button>
          <span className="mt-3 text-[10px] sm:text-xs font-medium tracking-wider text-slate-500 uppercase">
             {isConnecting ? 'Connecting...' : 'End Session'}
          </span>
        </div>
      )}
    </div>
  );
};

export default Controls;