package com.worthwyl.osv3.data.db

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.worthwyl.osv3.data.models.EpisodeSnapshot
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SnapshotFirestoreDao @Inject constructor(
    private val firestore: FirebaseFirestore
) : SnapshotDao {

    private val collection = firestore.collection("episodes")

    override suspend fun insert(snapshot: EpisodeSnapshot) {
        collection.document(snapshot.id)
            .set(snapshot)
            .await()
    }

    override suspend fun recentSnapshots(novelId: String, limit: Int): List<EpisodeSnapshot> {
        return collection
            .whereEqualTo("novelId", novelId)
            .orderBy("episodeNumber", Query.Direction.DESCENDING)
            .limit(limit.toLong())
            .get()
            .await()
            .toObjects(EpisodeSnapshot::class.java)
    }

    override suspend fun allSnapshots(novelId: String): List<EpisodeSnapshot> {
        return collection
            .whereEqualTo("novelId", novelId)
            .orderBy("episodeNumber", Query.Direction.ASCENDING)
            .get()
            .await()
            .toObjects(EpisodeSnapshot::class.java)
    }

    override suspend fun latestSnapshot(novelId: String): EpisodeSnapshot? {
        val querySnapshot = collection
            .whereEqualTo("novelId", novelId)
            .orderBy("episodeNumber", Query.Direction.DESCENDING)
            .limit(1)
            .get()
            .await()

        return querySnapshot.documents.firstOrNull()?.toObject(EpisodeSnapshot::class.java)
    }

    override suspend fun allSnapshotsAcrossNovels(): List<EpisodeSnapshot> {
        return collection
            .get()
            .await()
            .toObjects(EpisodeSnapshot::class.java)
    }
}
