import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, TranscriptionItem, AudioSettings, StoredSession, VoiceProfile } from '../types';
import { createPcmBlob, base64Decode, pcmToAudioBuffer } from './audioUtils';
import { getSystemInstruction, VOICES, getWelcomeMessage, PROMPT_8S, getPrompt12s, MODEL_NAME, AUDIO_SAMPLE_RATE } from '../constants';
import { userService } from './userService';

interface ActiveAudioSource {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

// Helper to resolve voice profile with graceful fallback
const getEffectiveVoiceProfile = (voiceName?: string): VoiceProfile => {
  if (voiceName && VOICES[voiceName]) {
    return VOICES[voiceName];
  }
  return VOICES['Anubis'];
};

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
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canSendAudioRef = useRef<boolean>(false);
  
  // Recording References
  const recordingDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  // Playback References (Scheduling System)
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<ActiveAudioSource>>(new Set());
  
  // Session Reference
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  // Reconnection Logic
  const audioSettingsRef = useRef<AudioSettings | null>(null);
  const isIntentionalDisconnectRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const connectRef = useRef<((settings: AudioSettings) => Promise<void>) | null>(null); 

  // Silence Logic
  const lastAudioDetectedRef = useRef<number>(0);
  const silenceStartTimestampRef = useRef<number>(0);
  const promptLevelRef = useRef<number>(0); 
  const silenceIntervalRef = useRef<number | null>(null);
  const userHasSpokenRef = useRef<boolean>(false);
  const smoothedEnergyRef = useRef<number>(0);

  const SILENCE_DURATION = 5000; 
  const SPEECH_ENERGY_THRESHOLD = 25; // Adjusted to be more robust against background noise
  const ENERGY_SMOOTHING_FACTOR = 0.15; // Smoothing factor (0.0 - 1.0) to filter transient noise

  const cleanup = useCallback(() => {
    canSendAudioRef.current = false;
    
    // Stop Recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
    }

    // Close Session
    sessionPromiseRef.current = null;

    // Stop Processing
    if (processorRef.current) {
        try {
          processorRef.current.disconnect();
          processorRef.current.onaudioprocess = null;
        } catch (e) { /* ignore */ }
        processorRef.current = null;
    }
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.disconnect(); } catch (e) { /* ignore */ }
        sourceNodeRef.current = null;
    }
    analyserRef.current = null;

    // Stop Stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Stop Output Sources
    activeSourcesRef.current.forEach(({ source, gain }) => {
      try { source.stop(); } catch(e) {}
      try { gain.disconnect(); } catch(e) {}
    });
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    // Close Contexts
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current && outputContextRef.current.state !== 'closed') {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }

    // Clear Intervals
    if (silenceIntervalRef.current) {
        window.clearInterval(silenceIntervalRef.current);
        silenceIntervalRef.current = null;
    }
    
    recordingDestRef.current = null;
  }, []);

  const sendTextToSession = (text: string) => {
    sessionPromiseRef.current?.then((session: any) => {
        // Try to send a text message to the session
        // Note: This relies on the session object supporting 'send' for user text injection.
        if (typeof session.send === 'function') {
            session.send({ 
                parts: [{ text: text }],
                turnComplete: true 
            });
        }
    }).catch(console.error);
  };

  const connect = useCallback(async (settings: AudioSettings) => {
    isIntentionalDisconnectRef.current = false;
    audioSettingsRef.current = settings;
    
    const voiceProfile = getEffectiveVoiceProfile(settings.voiceName);

    promptLevelRef.current = 0;
    userHasSpokenRef.current = false;
    silenceStartTimestampRef.current = Date.now();
    recordedChunksRef.current = [];
    setRecordedBlob(null);
    canSendAudioRef.current = false;
    nextStartTimeRef.current = 0;
    smoothedEnergyRef.current = 0;
    activeSourcesRef.current.clear();

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setError(null);
    setConnectionState(ConnectionState.CONNECTING);
    setTranscripts([]); 

    try {
      const apiKey = settings.apiKey?.trim();
      if (!apiKey) {
        throw new Error('Gemini API key is required. Open Settings and add your key.');
      }

      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: AUDIO_SAMPLE_RATE });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      await inputContextRef.current.resume();
      await outputContextRef.current.resume();

      const recDest = outputContextRef.current.createMediaStreamDestination();
      recordingDestRef.current = recDest;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      setupAudioProcessing(stream, inputContextRef.current);

      const micSourceInOutputCtx = outputContextRef.current.createMediaStreamSource(stream);
      micSourceInOutputCtx.connect(recDest);

      // Recorder Setup
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4'; 
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = ''; 
      }
      
      const recorder = new MediaRecorder(recDest.stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType || 'audio/webm' });
        setRecordedBlob(blob);
      };

      recorder.start();

      const ai = new GoogleGenAI({ apiKey });
      
      // Inject welcome message instruction into system instruction to ensure it starts correctly
      const baseInstruction = getSystemInstruction(
        voiceProfile.id,
        Boolean(settings.increasedSensitivityMode)
      );
      const welcomeMsg = getWelcomeMessage(voiceProfile.name);
      const fullInstruction = `${baseInstruction}\n\nIMPORTANT: Start the conversation immediately by saying exactly the following to the user: "${welcomeMsg}"`;

      const config = {
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: fullInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceProfile.apiVoice } },
          },
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
        },
      };

      const callbacks = {
        onopen: () => {
          setConnectionState(ConnectionState.CONNECTED);
          retryCountRef.current = 0; 
          canSendAudioRef.current = true;
          
          // Reset silence tracking
          silenceStartTimestampRef.current = Date.now();
          startSilenceMonitor(voiceProfile.name);
        },
        onmessage: async (message: LiveServerMessage) => {
          handleServerMessage(message);
        },
        onerror: (e: ErrorEvent) => {
          console.error("Gemini Live Error:", e);
          if (!isIntentionalDisconnectRef.current) handleAutoReconnect();
          else {
             setConnectionState(ConnectionState.ERROR);
             setError("Connection error occurred.");
          }
        },
        onclose: (e: CloseEvent) => {
          if (!isIntentionalDisconnectRef.current) handleAutoReconnect();
          else setConnectionState(ConnectionState.DISCONNECTED);
        },
      };

      sessionPromiseRef.current = ai.live.connect({ ...config, callbacks });

    } catch (err: any) {
      console.error("Failed to connect:", err);
      const message = err?.message || "Failed to access microphone or connect to API.";
      const missingKey = typeof message === 'string' && message.includes('Gemini API key is required');
      if (!isIntentionalDisconnectRef.current && !missingKey) {
        handleAutoReconnect();
      } else {
        setError(message);
        setConnectionState(ConnectionState.ERROR);
        cleanup();
      }
    }
  }, [cleanup]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const startSilenceMonitor = (voiceName: string) => {
      if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);
      
      silenceIntervalRef.current = window.setInterval(() => {
        if (userHasSpokenRef.current) return;
        
        // If audio is currently playing, reset silence timer
        // We check if we are currently outputting audio by checking the schedule
        const outputCtx = outputContextRef.current;
        if (outputCtx && outputCtx.currentTime < nextStartTimeRef.current) {
           silenceStartTimestampRef.current = Date.now();
           return;
        }

        const silenceDuration = Date.now() - silenceStartTimestampRef.current;
        
        // Note: promptLevel 0 (Welcome) is now handled by system instruction.
        // We start checks at level 1.
        
        if (promptLevelRef.current <= 1 && silenceDuration > 10000) {
            // First nudge
            sendTextToSession(`System: The user has been silent. Please gently encourage them using this text: "${PROMPT_8S}"`);
            promptLevelRef.current = 2;
            silenceStartTimestampRef.current = Date.now();
        } else if (promptLevelRef.current === 2 && silenceDuration > 15000) {
            // Second nudge
            const prompt = getPrompt12s(voiceName);
            sendTextToSession(`System: The user is still silent. Please say: "${prompt}"`);
            promptLevelRef.current = 3; 
        }
      }, 100); 
  };

  const handleAutoReconnect = useCallback(() => {
    cleanup();
    const MAX_RETRIES = 5;
    const BASE_DELAY_MS = 1000;
    if (retryCountRef.current < MAX_RETRIES) {
      const delay = Math.min(BASE_DELAY_MS * Math.pow(2, retryCountRef.current), 10000);
      setConnectionState(ConnectionState.CONNECTING);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        if (connectRef.current && audioSettingsRef.current) {
           retryCountRef.current++;
           connectRef.current(audioSettingsRef.current);
        }
      }, delay);
    } else {
      setError("Connection lost. Unable to reconnect after multiple attempts.");
      setConnectionState(ConnectionState.ERROR);
    }
  }, [cleanup]);

  const setupAudioProcessing = (stream: MediaStream, ctx: AudioContext) => {
    const source = ctx.createMediaStreamSource(stream);
    sourceNodeRef.current = source;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.5;
    source.connect(analyser);
    analyserRef.current = analyser;

    // Reduced buffer size from 4096 to 2048 to improve visualizer responsiveness and lower latency
    const processor = ctx.createScriptProcessor(2048, 1, 1);
    processorRef.current = processor;

    lastAudioDetectedRef.current = Date.now();

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate energy in voice frequency band (approx 100Hz - 3500Hz)
      // Bin size = SampleRate(16000) / FFTSize(512) = 31.25 Hz
      // Start Bin ~3 (93Hz) to Bin ~112 (3500Hz)
      // This filters out low rumble and high hiss
      let speechEnergy = 0;
      let binCount = 0;
      for (let i = 3; i < 112; i++) {
        speechEnergy += dataArray[i];
        binCount++;
      }
      const currentAvgEnergy = speechEnergy / binCount;

      // Apply low-pass smoothing filter to energy to reject transient noise/clicks
      // smoothedEnergy = prev * (1 - alpha) + current * alpha
      smoothedEnergyRef.current = 
        (smoothedEnergyRef.current * (1 - ENERGY_SMOOTHING_FACTOR)) + 
        (currentAvgEnergy * ENERGY_SMOOTHING_FACTOR);

      const smoothedEnergy = smoothedEnergyRef.current;

      // Visualizer volume derived from smoothed energy (scaled for visuals)
      const instantVolume = Math.min(smoothedEnergy / 80, 1);
      setVolume(prev => prev * 0.7 + instantVolume * 0.3);

      // Robust voice activity detection with smoothed energy and dynamic threshold
      if (smoothedEnergy > SPEECH_ENERGY_THRESHOLD) {
        lastAudioDetectedRef.current = Date.now();
        silenceStartTimestampRef.current = Date.now();
        userHasSpokenRef.current = true;
      }

      if (canSendAudioRef.current && Date.now() - lastAudioDetectedRef.current < SILENCE_DURATION) {
         const pcmBlob = createPcmBlob(inputData, AUDIO_SAMPLE_RATE);
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

    if (message.serverContent?.interrupted) {
       // Stop all active sources immediately
       const now = outputCtx.currentTime;
       activeSourcesRef.current.forEach(({ source, gain }) => {
        try {
            gain.gain.cancelScheduledValues(now);
            gain.gain.setValueAtTime(gain.gain.value, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.05); 
            source.stop(now + 0.05);
        } catch(e) { /* ignore */ }
       });
       activeSourcesRef.current.clear();
       
       // Reset scheduling cursor
       nextStartTimeRef.current = now;
       silenceStartTimestampRef.current = Date.now();
       return;
    }

    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
        if (outputCtx.state === 'suspended') await outputCtx.resume();
        const audioBytes = base64Decode(audioData);
        const audioBuffer = await pcmToAudioBuffer(audioBytes, outputCtx, 24000);
        
        // --- Scheduler Logic ---
        
        // Ensure we don't schedule in the past if there was a buffer underrun
        const currentTime = outputCtx.currentTime;
        if (nextStartTimeRef.current < currentTime) {
            nextStartTimeRef.current = currentTime;
        }
        
        const source = outputCtx.createBufferSource();
        source.buffer = audioBuffer;
        
        const voiceProfile = getEffectiveVoiceProfile(audioSettingsRef.current?.voiceName);
        let playbackRate = 1.0;
        
        if (voiceProfile.pitchShift !== 0) {
            source.detune.value = voiceProfile.pitchShift * 100;
            // Calculate playback rate change: 2^(cents/1200)
            playbackRate = Math.pow(2, (voiceProfile.pitchShift * 100) / 1200);
        }

        const gainNode = outputCtx.createGain();
        gainNode.connect(outputCtx.destination);
        if (recordingDestRef.current) {
            gainNode.connect(recordingDestRef.current);
        }
        source.connect(gainNode);

        source.start(nextStartTimeRef.current);
        
        // Advance cursor by the *actual* duration of this chunk
        const actualDuration = audioBuffer.duration / playbackRate;
        nextStartTimeRef.current += actualDuration;
        
        const activeItem = { source, gain: gainNode };
        activeSourcesRef.current.add(activeItem);

        source.onended = () => {
            activeSourcesRef.current.delete(activeItem);
        };
    }

    const serverContent = message.serverContent;
    if (serverContent) {
        if (serverContent.outputTranscription?.text) {
             updateTranscript('model', serverContent.outputTranscription.text, !!serverContent.turnComplete);
        }
        if (serverContent.inputTranscription?.text) {
             updateTranscript('user', serverContent.inputTranscription.text, !!serverContent.turnComplete);
             userHasSpokenRef.current = true;
        }
    }
  };

  const updateTranscript = (role: 'user' | 'model', text: string, isComplete: boolean) => {
    setTranscripts(prev => {
      const last = prev[prev.length - 1];
      const newId = Date.now().toString() + Math.random().toString();
      if (last && last.role === role && !last.isComplete) {
        const updated = [...prev];
        updated[updated.length - 1] = { ...last, text: last.text + text, isComplete: isComplete };
        return updated;
      } else {
        return [...prev, { id: newId, role, text, isComplete }];
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

  const saveCurrentSession = useCallback(async (username: string) => {
      if (!transcripts.length) return;
      
      const sessionBlob = recordedBlob; 
      
      let finalBlob = sessionBlob;
      if (!finalBlob && recordedChunksRef.current.length > 0) {
         finalBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
      }

      const session: StoredSession = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          transcripts: transcripts,
          audioBlob: finalBlob || undefined
      };

      await userService.saveSession(username, session);
  }, [transcripts, recordedBlob]);

  return {
    connect,
    disconnect,
    saveCurrentSession,
    connectionState,
    volume,
    transcripts,
    error,
    recordedBlob, 
  };
};
