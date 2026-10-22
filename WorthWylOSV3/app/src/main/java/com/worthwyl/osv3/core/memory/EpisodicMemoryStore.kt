package com.worthwyl.osv3.core.memory

import com.worthwyl.osv3.data.db.SnapshotDao
import com.worthwyl.osv3.data.models.EpisodeSnapshot
import javax.inject.Inject

class EpisodicMemoryStore @Inject constructor(
    private val dao: SnapshotDao
) {
    suspend fun save(snapshot: EpisodeSnapshot) = dao.insert(snapshot)
    suspend fun recent(id: String, limit: Int = 5) = dao.recentSnapshots(id, limit)
    suspend fun all(id: String) = dao.allSnapshots(id)
    suspend fun latest(id: String) = dao.latestSnapshot(id)
    suspend fun getAllSnapshotsAcrossNovels() = dao.allSnapshotsAcrossNovels()

    suspend fun saveReflection(id: String, reflection: String) {
        // Extend schema later
    }
}
