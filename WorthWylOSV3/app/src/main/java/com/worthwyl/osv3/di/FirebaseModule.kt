package com.worthwyl.osv3.di

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ktx.firestore
import com.google.firebase.ktx.Firebase
import com.worthwyl.osv3.data.db.SnapshotDao
import com.worthwyl.osv3.data.db.SnapshotFirestoreDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object FirebaseModule {

    @Provides
    @Singleton
    fun provideFirebaseFirestore(): FirebaseFirestore {
        return Firebase.firestore
    }

    @Provides
    @Singleton
    fun provideSnapshotDao(firestoreDao: SnapshotFirestoreDao): SnapshotDao {
        return firestoreDao
    }
}
