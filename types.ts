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
  voiceName: string;
  increasedSensitivityMode: boolean;
}

export interface VoiceProfile {
  id: string;
  name: string;
  apiVoice: string;
  systemDescription: string;
  pitchShift: number; // Semitones
}

export interface User {
  username: string;
  passwordHash: string; // Stored locally
}

export interface StoredSession {
  id: string;
  timestamp: number;
  transcripts: TranscriptionItem[];
  audioBlob?: Blob; // Not stored in localStorage, but handled in memory for download
}
