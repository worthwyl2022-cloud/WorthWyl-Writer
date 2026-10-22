// src/data/db/SnapshotDao.ts
import { EpisodeSnapshot } from "@/src/data/models/EpisodeSnapshot";

export interface SnapshotDao {
  insert(snapshot: EpisodeSnapshot): Promise<void>;
  recentSnapshots(novelId: string, limit: number): Promise<EpisodeSnapshot[]>;
  allSnapshots(novelId: string): Promise<EpisodeSnapshot[]>;
  latestSnapshot(novelId: string): Promise<EpisodeSnapshot | null>;
  allSnapshotsAcrossNovels(): Promise<EpisodeSnapshot[]>;
}
