import { EpisodeSnapshot, ContinuityState } from "@/src/models/domain";

export class ContinuityTracker {
  buildState(snapshots: EpisodeSnapshot[]): ContinuityState {
    return {
      characters: {},
      locations: {},
      openThreads: [],
      resolvedThreads: []
    };
  }
}
