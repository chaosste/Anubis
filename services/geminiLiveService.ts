import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, TranscriptionItem, AudioSettings } from '../types';
import { createPcmBlob, base64Decode, pcmToAudioBuffer } from './audioUtils';
import { SYSTEM_INSTRUCTION } from '../constants';

export const useGeminiLive = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [transcripts, setTranscripts] = useState<TranscriptionItem[]>([]);
  const [volume, setVolume] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Audio Contexts
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  
  // Streaming References
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Playback References
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session Reference
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const currentTurnIdRef = useRef<string>('');

  // Reconnection Logic Refs
  const audioSettingsRef = useRef<AudioSettings | null>(null);
  const isIntentionalDisconnectRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const connectRef = useRef<((settings: AudioSettings) => Promise<void>) | null>(null); // For cyclic access

  // Silence Detection Refs
  const lastAudioDetectedRef = useRef<number>(0);
  const SILENCE_THRESHOLD = 0.01;
  const SILENCE_DURATION = 5000; // 5 seconds

  const cleanup = useCallback(() => {
    // 1. Close Session Reference
    sessionPromiseRef.current = null;

    // 2. Stop Audio Processing
    if (processorRef.current) {
        try {
          processorRef.current.disconnect();
          processorRef.current.onaudioprocess = null;
        } catch (e) { /* ignore */ }
        processorRef.current = null;
    }
    if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (e) { /* ignore */ }
        sourceNodeRef.current = null;
    }

    // 3. Stop Media Stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // 4. Close Audio Contexts
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current && outputContextRef.current.state !== 'closed') {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
  }, []);

  const connect = useCallback(async (settings: AudioSettings) => {
    // Reset intentional disconnect flag as this is a new connection attempt
    isIntentionalDisconnectRef.current = false;
    audioSettingsRef.current = settings;

    // Clear any pending reconnect timeouts if this is a manual connect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setError(null);
    setConnectionState(ConnectionState.CONNECTING);

    try {
      // 1. Initialize Audio Contexts with configured sample rate
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: settings.sampleRate 
      });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: 24000 // Output from model is consistently 24k currently
      });

      // 2. Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 3. Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Map custom voice names to valid API voice names
      let apiVoiceName = settings.voiceName;
      if (apiVoiceName === 'Vindemiatrix') {
        apiVoiceName = 'Kore'; // Mapping to a valid female voice to contrast with Fenrir/Charon
      }
      
      const config = {
        model: settings.model,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: apiVoiceName } },
          },
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
        },
      };

      // 4. Setup Callbacks
      const callbacks = {
        onopen: () => {
          setConnectionState(ConnectionState.CONNECTED);
          retryCountRef.current = 0; // Reset retry count on successful connection
          startAudioInput(settings.sampleRate);
        },
        onmessage: async (message: LiveServerMessage) => {
          handleServerMessage(message);
        },
        onerror: (e: ErrorEvent) => {
          console.error("Gemini Live Error:", e);
          // If intentional, user stopped it, so we don't reconnect.
          if (!isIntentionalDisconnectRef.current) {
             handleAutoReconnect();
          } else {
             setConnectionState(ConnectionState.ERROR);
             setError("Connection error occurred.");
          }
        },
        onclose: (e: CloseEvent) => {
          console.log("Gemini Live Closed");
          if (!isIntentionalDisconnectRef.current) {
             handleAutoReconnect();
          } else {
             setConnectionState(ConnectionState.DISCONNECTED);
          }
        },
      };

      // 5. Connect
      sessionPromiseRef.current = ai.live.connect({ ...config, callbacks });

    } catch (err: any) {
      console.error("Failed to connect:", err);
      // If immediate failure, we might want to retry or just show error
      if (!isIntentionalDisconnectRef.current) {
         handleAutoReconnect();
      } else {
         setError(err.message || "Failed to access microphone or connect to API.");
         setConnectionState(ConnectionState.ERROR);
         cleanup();
      }
    }
  }, [cleanup]); // connect depends on cleanup

  // Update ref whenever connect changes
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const handleAutoReconnect = useCallback(() => {
    cleanup();
    
    const MAX_RETRIES = 5;
    const BASE_DELAY_MS = 1000;

    if (retryCountRef.current < MAX_RETRIES) {
      const delay = Math.min(BASE_DELAY_MS * Math.pow(2, retryCountRef.current), 10000);
      
      console.log(`Connection lost. Attempting reconnect #${retryCountRef.current + 1} in ${delay}ms...`);
      setConnectionState(ConnectionState.CONNECTING);
      
      reconnectTimeoutRef.current = window.setTimeout(() => {
        if (connectRef.current && audioSettingsRef.current) {
           retryCountRef.current++;
           connectRef.current(audioSettingsRef.current);
        }
      }, delay);
    } else {
      console.error("Max retries reached. Stopping reconnection attempts.");
      setError("Connection lost. Unable to reconnect after multiple attempts.");
      setConnectionState(ConnectionState.ERROR);
    }
  }, [cleanup]);

  const startAudioInput = (sampleRate: number) => {
    if (!inputContextRef.current || !mediaStreamRef.current) return;

    const ctx = inputContextRef.current;
    const source = ctx.createMediaStreamSource(mediaStreamRef.current);
    sourceNodeRef.current = source;

    // Use ScriptProcessor for raw PCM access
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    // Initialize silence detection timestamp
    lastAudioDetectedRef.current = Date.now();

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      setVolume((prev) => prev * 0.8 + rms * 0.2); 

      // Silence Detection
      if (rms > SILENCE_THRESHOLD) {
        lastAudioDetectedRef.current = Date.now();
      }

      // Check if we are within the allowed silence window
      if (Date.now() - lastAudioDetectedRef.current < SILENCE_DURATION) {
         // Send to API
         const pcmBlob = createPcmBlob(inputData, sampleRate);
         sessionPromiseRef.current?.then((session: any) => {
           session.sendRealtimeInput({ media: pcmBlob });
         }).catch(console.error);
      }
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  };

  const handleServerMessage = async (message: LiveServerMessage) => {
    const outputCtx = outputContextRef.current;
    if (!outputCtx) return;

    // 1. Handle Audio Output
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);

        const audioBytes = base64Decode(audioData);
        const audioBuffer = await pcmToAudioBuffer(audioBytes, outputCtx, 24000);
        
        const source = outputCtx.createBufferSource();
        source.buffer = audioBuffer;
        
        const gainNode = outputCtx.createGain();
        gainNode.connect(outputCtx.destination);
        source.connect(gainNode);

        source.addEventListener('ended', () => {
          activeSourcesRef.current.delete(source);
        });

        source.start(nextStartTimeRef.current);
        nextStartTimeRef.current += audioBuffer.duration;
        activeSourcesRef.current.add(source);
    }

    // 2. Handle Interruption
    if (message.serverContent?.interrupted) {
      console.log("Interrupted by user");
      activeSourcesRef.current.forEach((src) => {
        try { src.stop(); } catch(e) {}
      });
      activeSourcesRef.current.clear();
      nextStartTimeRef.current = 0;
    }

    // 3. Handle Transcripts
    const serverContent = message.serverContent;
    if (serverContent) {
        if (serverContent.outputTranscription?.text) {
             updateTranscript('model', serverContent.outputTranscription.text, !!serverContent.turnComplete);
        }
        if (serverContent.inputTranscription?.text) {
             updateTranscript('user', serverContent.inputTranscription.text, !!serverContent.turnComplete);
        }
    }
  };

  const updateTranscript = (role: 'user' | 'model', text: string, isComplete: boolean) => {
    setTranscripts(prev => {
      const last = prev[prev.length - 1];
      const newId = Date.now().toString() + Math.random().toString();

      if (last && last.role === role && !last.isComplete) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          text: last.text + text,
          isComplete: isComplete
        };
        return updated;
      } else {
        return [...prev, {
          id: newId,
          role,
          text,
          isComplete
        }];
      }
    });
  };

  const disconnect = useCallback(() => {
    isIntentionalDisconnectRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    cleanup();
    setConnectionState(ConnectionState.DISCONNECTED);
    setVolume(0);
  }, [cleanup]);

  return {
    connect,
    disconnect,
    connectionState,
    volume,
    transcripts,
    error,
  };
};