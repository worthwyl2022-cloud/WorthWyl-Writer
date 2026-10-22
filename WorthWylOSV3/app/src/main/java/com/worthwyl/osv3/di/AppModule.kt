package com.worthwyl.osv3.di

import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.ktx.analytics
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.google.firebase.crashlytics.ktx.crashlytics
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.ktx.messaging
import com.google.firebase.remoteconfig.FirebaseRemoteConfig
import com.google.firebase.remoteconfig.ktx.remoteConfig
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideAnalytics(): FirebaseAnalytics = Firebase.analytics

    @Provides
    @Singleton
    fun provideCrashlytics(): FirebaseCrashlytics = Firebase.crashlytics

    @Provides
    @Singleton
    fun provideRemoteConfig(): FirebaseRemoteConfig = Firebase.remoteConfig.apply {
        setDefaultsAsync(
            mapOf(
                "pipeline_default" to "write",
                "persona_bias" to "dark",
                "visionpacingweight" to 0.7,
                "antigravity_mode" to "disabled"
            )
        )
    }

    @Provides
    @Singleton
    fun provideMessaging(): FirebaseMessaging = Firebase.messaging
}
