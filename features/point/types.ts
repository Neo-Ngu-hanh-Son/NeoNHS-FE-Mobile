export interface WordTiming {
  text: string;
  start: number;
  end: number;
}

export interface AudioMetadata {
  mode: string;
  modelId: string;
  voiceId: string;
  language: string;
  title: string;
  artist: string;
  coverImage?: string;
}

export interface PointHistoryAudioResponse {
  id: string;
  pointId: string;
  audioUrl: string;
  historyText: string;
  words: WordTiming[];
  metadata: AudioMetadata;
  createdAt: Date | string;
  updatedAt: Date | string;
}

type HistoryWordFlowProps = {
  words: WordTiming[];
  activeIndex: number;
};
