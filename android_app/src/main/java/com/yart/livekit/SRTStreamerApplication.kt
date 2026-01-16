package com.yart.livekit

import android.app.Application
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

class SRTStreamerApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Manual Firebase initialization with actual credentials
        try {
            if (FirebaseApp.getApps(this).isEmpty()) {
                val options = FirebaseOptions.Builder()
                    .setApplicationId("1:689634907368:android:46e494b523fd071d21655d")
                    .setApiKey("AIzaSyBYDvDE8oeUR2t9GJ75StPp4GxXTn7qe8w")
                    .setDatabaseUrl("https://yrat-livekit-default-rtdb.asia-southeast1.firebasedatabase.app")
                    .setProjectId("yrat-livekit")
                    .build()
                
                FirebaseApp.initializeApp(this, options)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
