export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface TranscriptionItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  isComplete: boolean;
}

export interface AudioSettings {
  sampleRate: number;
  bitDepth: number;
  voiceName: string;
  model: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  apiVoice: string;
  systemDescription: string;
  pitchShift: number; // Semitones
}