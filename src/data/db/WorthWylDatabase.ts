// src/data/db/WorthWylDatabase.ts
import { SnapshotDao } from "./SnapshotDao";

export abstract class WorthWylDatabase {
  abstract snapshotDao(): SnapshotDao;
}
