package com.worthwyl.osv3.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class EpisodeSnapshot(
    @PrimaryKey val id: String = "",
    val novelId: String = "",
    val episodeNumber: Int = 0,
    val createdAt: Long = 0L,
    val text: String = "",
    val screenshotPath: String = "",
    val characters: List<String> = emptyList(),
    val locations: List<String> = emptyList(),
    val tags: List<String> = emptyList(),
    val tone: String = "",
    val pacing: String = "",
    val openThreads: List<String> = emptyList(),
    val resolvedThreads: List<String> = emptyList()
)
