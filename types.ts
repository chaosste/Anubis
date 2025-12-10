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

export interface AudioVisualizerData {
  volume: number; // 0 to 1
}

export interface AudioSettings {
  sampleRate: number;
  bitDepth: number;
}
