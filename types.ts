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

export interface CanonicalProtocolPackage {
  protocolVersion: string;
  exportedAt: string;
  sourceApp: string;
  session: {
    id: string;
    timestamp: number;
  };
  analysis: {
    summary: string;
    takeaways: string[];
    modalities: string[];
    phasesCount: number;
    codebookSuggestions: { label: string; rationale: string; exemplarQuote: string }[];
    diachronicStructure: { phaseName: string; description: string; startTime: string }[];
    synchronicStructure: { category: string; details: string }[];
    transcript: { speaker: 'Interviewer' | 'Interviewee' | 'AI'; text: string; timestamp: string }[];
  };
  coding: {
    codes: { id: string; name: string; color: string }[];
    annotations: { id: string; codeId: string; segmentIndex: number; startOffset: number; endOffset: number; text: string }[];
  };
}
