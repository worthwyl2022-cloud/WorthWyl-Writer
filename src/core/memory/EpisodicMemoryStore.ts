// src/core/memory/EpisodicMemoryStore.ts
import { EpisodeSnapshot } from "@/src/data/models/EpisodeSnapshot";
import { SnapshotDao } from "@/src/data/db/SnapshotDao";

export class EpisodicMemoryStore {
  constructor(private dao: SnapshotDao) {}

  async save(snapshot: EpisodeSnapshot): Promise<void> {
    await this.dao.insert(snapshot);
  }

  async recent(novelId: string, limit: number = 5): Promise<EpisodeSnapshot[]> {
    return this.dao.recentSnapshots(novelId, limit);
  }

  async all(novelId: string): Promise<EpisodeSnapshot[]> {
    return this.dao.allSnapshots(novelId);
  }

  async latest(novelId: string): Promise<EpisodeSnapshot | null> {
    return this.dao.latestSnapshot(novelId);
  }

  async getAllSnapshotsAcrossNovels(): Promise<EpisodeSnapshot[]> {
    return this.dao.allSnapshotsAcrossNovels();
  }

  async saveReflection(id: string, reflection: string): Promise<void> {
    // Extend schema later
  }
}
