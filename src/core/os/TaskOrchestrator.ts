import { EpisodeSnapshot } from "@/src/data/models/EpisodeSnapshot";
import { EpisodicMemoryStore } from "@/src/core/memory/EpisodicMemoryStore";

export class TaskOrchestrator {
  constructor(private memory: EpisodicMemoryStore) {}

  async writeNextEpisode(novelId: string): Promise<EpisodeSnapshot> {
    const recent = await this.memory.recent(novelId, 1);
    const nextNumber = (recent.length > 0 ? recent[0].episodeNumber : 0) + 1;
    
    // Stubbed snapshot
    const snapshot: EpisodeSnapshot = {
      id: crypto.randomUUID(),
      novelId,
      episodeNumber: nextNumber,
      createdAt: Date.now(),
      text: `Placeholder episode ${nextNumber}`,
      screenshotPath: "",
      characters: [],
      locations: [],
      tags: [],
      tone: "neutral",
      pacing: "medium",
      openThreads: [],
      resolvedThreads: []
    };
    
    await this.memory.save(snapshot);
    return snapshot;
  }
}
