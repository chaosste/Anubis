import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, TranscriptionItem, AudioSettings, StoredSession } from '../types';
import { createPcmBlob, base64Decode, pcmToAudioBuffer } from './audioUtils';
import { getSystemInstruction, VOICES, getWelcomeMessage, PROMPT_8S, getPrompt12s, MODEL_NAME, AUDIO_SAMPLE_RATE } from '../constants';
import { userService } from './userService';

interface ActiveAudioSource {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

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

  // Playback References (Queue System)
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);
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

  const SILENCE_DURATION = 5000; 
  const SPEECH_ENERGY_THRESHOLD = 20; 

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
    
    // Clear Audio Queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    activeSourcesRef.current.clear();
    recordingDestRef.current = null;

  }, []);

  const sendTextToSession = (text: string) => {
    sessionPromiseRef.current?.then((session: any) => {
        if (typeof session.send === 'function') {
            session.send({ 
                parts: [{ text: `System Instruction: Please say exactly the following text to the user: "${text}"` }],
                turnComplete: true 
            });
        }
    }).catch(console.error);
  };

  const connect = useCallback(async (settings: AudioSettings) => {
    isIntentionalDisconnectRef.current = false;
    audioSettingsRef.current = settings;
    
    promptLevelRef.current = 0;
    userHasSpokenRef.current = false;
    silenceStartTimestampRef.current = Date.now();
    recordedChunksRef.current = [];
    setRecordedBlob(null);
    canSendAudioRef.current = false;
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setError(null);
    setConnectionState(ConnectionState.CONNECTING);
    setTranscripts([]); 

    try {
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

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const voiceProfile = VOICES[settings.voiceName] || VOICES['Anubis'];
      
      const config = {
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: getSystemInstruction(settings.voiceName),
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
          startSilenceMonitor(settings.voiceName);
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
          console.log("Gemini Live Closed");
          if (!isIntentionalDisconnectRef.current) handleAutoReconnect();
          else setConnectionState(ConnectionState.DISCONNECTED);
        },
      };

      sessionPromiseRef.current = ai.live.connect({ ...config, callbacks });

    } catch (err: any) {
      console.error("Failed to connect:", err);
      if (!isIntentionalDisconnectRef.current) handleAutoReconnect();
      else {
         setError(err.message || "Failed to access microphone or connect to API.");
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
        
        // Use isPlayingRef to check if AI is currently outputting audio
        if (isPlayingRef.current) {
            silenceStartTimestampRef.current = Date.now();
            return;
        }

        const silenceDuration = Date.now() - silenceStartTimestampRef.current;
        
        if (promptLevelRef.current === 0 && silenceDuration > 2000) {
            sendTextToSession(getWelcomeMessage(voiceName));
            promptLevelRef.current = 1;
            silenceStartTimestampRef.current = Date.now();
        } else if (promptLevelRef.current === 1 && silenceDuration > 8000) {
            sendTextToSession(PROMPT_8S);
            promptLevelRef.current = 2;
            silenceStartTimestampRef.current = Date.now();
        } else if (promptLevelRef.current === 2 && silenceDuration > 12000) {
            sendTextToSession(getPrompt12s(voiceName));
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

    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    lastAudioDetectedRef.current = Date.now();

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      let speechEnergy = 0;
      let binCount = 0;
      for (let i = 3; i < 96; i++) {
        speechEnergy += dataArray[i];
        binCount++;
      }
      const avgEnergy = speechEnergy / binCount;
      const instantVolume = Math.min(avgEnergy / 100, 1);
      setVolume(prev => prev * 0.7 + instantVolume * 0.3);

      if (avgEnergy > SPEECH_ENERGY_THRESHOLD) {
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

    // Handle Interruption first
    if (message.serverContent?.interrupted) {
       audioQueueRef.current = []; // Clear queue
       isPlayingRef.current = false;
       
       const now = outputCtx.currentTime;
       activeSourcesRef.current.forEach(({ source, gain }) => {
        try {
            gain.gain.cancelScheduledValues(now);
            gain.gain.setValueAtTime(gain.gain.value, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1); 
            source.stop(now + 0.1);
        } catch(e) { /* ignore */ }
       });
       activeSourcesRef.current.clear();
       silenceStartTimestampRef.current = Date.now();
       return;
    }

    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
        if (outputCtx.state === 'suspended') await outputCtx.resume();
        const audioBytes = base64Decode(audioData);
        const audioBuffer = await pcmToAudioBuffer(audioBytes, outputCtx, 24000);
        
        audioQueueRef.current.push(audioBuffer);
        
        if (!isPlayingRef.current) {
            playNextInBuffer(outputCtx);
        }
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

  const playNextInBuffer = (ctx: AudioContext) => {
      if (audioQueueRef.current.length === 0) {
          isPlayingRef.current = false;
          silenceStartTimestampRef.current = Date.now();
          return;
      }

      isPlayingRef.current = true;
      const buffer = audioQueueRef.current.shift();
      if (!buffer) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      
      const voiceProfile = VOICES[audioSettingsRef.current?.voiceName || 'Anubis'] || VOICES['Anubis'];
      if (voiceProfile.pitchShift !== 0) {
          source.detune.value = voiceProfile.pitchShift * 100;
      }

      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      if (recordingDestRef.current) {
          gainNode.connect(recordingDestRef.current);
      }
      source.connect(gainNode);

      source.start();
      
      const activeItem = { source, gain: gainNode };
      activeSourcesRef.current.add(activeItem);

      source.onended = () => {
          activeSourcesRef.current.delete(activeItem);
          playNextInBuffer(ctx);
      };
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
      // If we call this immediately after disconnect, the blob state might be ready or in ref
      // We'll prefer the state blob, but check the ref chunks if needed (fallback)
      
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