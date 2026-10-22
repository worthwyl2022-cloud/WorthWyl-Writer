// src/data/models/EpisodeSnapshot.ts
export interface EpisodeSnapshot {
  id: string;
  novelId: string;
  episodeNumber: number;
  createdAt: number;
  text: string;
  screenshotPath: string;
  characters: string[];
  locations: string[];
  tags: string[];
  tone: string;
  pacing: string;
  openThreads: string[];
  resolvedThreads: string[];
}
