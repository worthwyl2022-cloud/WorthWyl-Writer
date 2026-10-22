package com.worthwyl.osv3.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.worthwyl.osv3.data.models.EpisodeSnapshot

@Dao
interface SnapshotDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(snapshot: EpisodeSnapshot)

    @Query("SELECT * FROM EpisodeSnapshot WHERE novelId = :novelId ORDER BY episodeNumber DESC LIMIT :limit")
    suspend fun recentSnapshots(novelId: String, limit: Int): List<EpisodeSnapshot>

    @Query("SELECT * FROM EpisodeSnapshot WHERE novelId = :novelId ORDER BY episodeNumber ASC")
    suspend fun allSnapshots(novelId: String): List<EpisodeSnapshot>

    @Query("SELECT * FROM EpisodeSnapshot WHERE novelId = :novelId ORDER BY episodeNumber DESC LIMIT 1")
    suspend fun latestSnapshot(novelId: String): EpisodeSnapshot?

    @Query("SELECT * FROM EpisodeSnapshot")
    suspend fun allSnapshotsAcrossNovels(): List<EpisodeSnapshot>
}
