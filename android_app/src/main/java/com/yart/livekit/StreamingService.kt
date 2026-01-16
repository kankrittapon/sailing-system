package com.yart.livekit

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat

class StreamingService : Service() {

    private var wakeLock: PowerManager.WakeLock? = null
    private lateinit var srtStreamer: SRTStreamer
    
    companion object {
        const val CHANNEL_ID = "StreamingServiceChannel"
        const val NOTIFICATION_ID = 1
        const val ACTION_START = "START_STREAMING"
        const val ACTION_STOP = "STOP_STREAMING"
        const val EXTRA_SERVER_IP = "SERVER_IP"
        const val EXTRA_BOAT_ID = "BOAT_ID"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        
        // Acquire wake lock to keep CPU running
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "SRTStreamer::StreamingWakeLock"
        )
        wakeLock?.acquire()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val serverIp = intent.getStringExtra(EXTRA_SERVER_IP) ?: return START_NOT_STICKY
                val boatId = intent.getStringExtra(EXTRA_BOAT_ID) ?: "Unknown"
                startForegroundService(serverIp, boatId)
            }
            ACTION_STOP -> {
                stopForegroundService()
            }
        }
        return START_STICKY
    }

    private fun startForegroundService(serverIp: String, boatId: String) {
        val notification = createNotification(boatId, "Streaming to $serverIp")
        startForeground(NOTIFICATION_ID, notification)
        
        // Initialize and start streaming
        // Note: This is a simplified version. In production, you'd need to handle
        // camera/audio initialization properly in a service context
    }

    private fun stopForegroundService() {
        wakeLock?.release()
        stopForeground(true)
        stopSelf()
    }

    private fun createNotification(boatId: String, message: String): Notification {
        val stopIntent = Intent(this, StreamingService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 0, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("🎥 Streaming: $boatId")
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .addAction(
                android.R.drawable.ic_media_pause,
                "Stop",
                stopPendingIntent
            )
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Streaming Service",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Shows streaming status"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        wakeLock?.release()
    }
}
