package com.worthwyl.osv3.data.db

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.worthwyl.osv3.data.models.EpisodeSnapshot

@Database(
    entities = [EpisodeSnapshot::class],
    version = 1
)
@TypeConverters(ListConverters::class)
abstract class WorthWylDatabase : RoomDatabase() {
    abstract fun snapshotDao(): SnapshotDao
}
