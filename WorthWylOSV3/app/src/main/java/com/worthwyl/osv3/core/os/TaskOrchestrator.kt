package com.worthwyl.osv3.core.os

import com.worthwyl.osv3.data.db.SnapshotFirestoreDao
import com.worthwyl.osv3.data.models.EpisodeSnapshot
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TaskOrchestrator @Inject constructor(
    private val snapshotFirestoreDao: SnapshotFirestoreDao
) {
    suspend fun saveEpisode(snapshot: EpisodeSnapshot) {
        snapshotFirestoreDao.insert(snapshot)
    }

    suspend fun getRecentSnapshots(novelId: String, limit: Int = 5): List<EpisodeSnapshot> {
        return snapshotFirestoreDao.recentSnapshots(novelId, limit)
    }

    suspend fun getAllSnapshots(novelId: String): List<EpisodeSnapshot> {
        return snapshotFirestoreDao.allSnapshots(novelId)
    }

    suspend fun getLatestSnapshot(novelId: String): EpisodeSnapshot? {
        return snapshotFirestoreDao.latestSnapshot(novelId)
    }

    suspend fun getAllSnapshotsAcrossNovels(): List<EpisodeSnapshot> {
        return snapshotFirestoreDao.allSnapshotsAcrossNovels()
    }
}
