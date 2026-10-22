import { EpisodeSnapshot } from "@/src/models/domain";

export class VisualTextCoherenceEngine {
  async enrich(snapshot: EpisodeSnapshot): Promise<EpisodeSnapshot> {
    // Stub
    return snapshot;
  }

  buildNextContext(recent: EpisodeSnapshot[]): string {
    return "Recent context stub";
  }
}
