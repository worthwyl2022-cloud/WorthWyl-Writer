// src/data/db/SnapshotFirestoreDao.ts
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit, 
  setDoc,
  Firestore 
} from "firebase/firestore";
import { EpisodeSnapshot } from "@/src/data/models/EpisodeSnapshot";
import { SnapshotDao } from "./SnapshotDao";
import { db } from "@/src/lib/db";

export class SnapshotFirestoreDao implements SnapshotDao {
  private firestore: Firestore;

  constructor(firestore: Firestore = db) {
    this.firestore = firestore;
  }

  private get episodesRef() {
    return collection(this.firestore, "episodes");
  }

  async insert(snapshot: EpisodeSnapshot): Promise<void> {
    await setDoc(doc(this.episodesRef, snapshot.id), snapshot);
  }

  async recentSnapshots(novelId: string, limit: number): Promise<EpisodeSnapshot[]> {
    const q = query(
      this.episodesRef,
      where("novelId", "==", novelId),
      orderBy("episodeNumber", "desc"),
      firestoreLimit(limit)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as EpisodeSnapshot);
  }

  async allSnapshots(novelId: string): Promise<EpisodeSnapshot[]> {
    const q = query(
      this.episodesRef,
      where("novelId", "==", novelId),
      orderBy("episodeNumber", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as EpisodeSnapshot);
  }

  async latestSnapshot(novelId: string): Promise<EpisodeSnapshot | null> {
    const q = query(
      this.episodesRef,
      where("novelId", "==", novelId),
      orderBy("episodeNumber", "desc"),
      firestoreLimit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as EpisodeSnapshot;
  }

  async allSnapshotsAcrossNovels(): Promise<EpisodeSnapshot[]> {
    const snap = await getDocs(this.episodesRef);
    return snap.docs.map(d => d.data() as EpisodeSnapshot);
  }
}
