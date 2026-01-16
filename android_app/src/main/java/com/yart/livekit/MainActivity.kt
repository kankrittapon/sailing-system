package com.yart.livekit

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.pedro.library.view.OpenGlView
import com.google.firebase.database.ktx.database
import com.google.firebase.database.ServerValue
import com.google.firebase.ktx.Firebase

class MainActivity : AppCompatActivity() {

    private lateinit var srtStreamer: SRTStreamer
    private lateinit var etServerIp: EditText
    private lateinit var btnStart: Button
    private lateinit var btnStop: Button
    private lateinit var openGlView: OpenGlView

    private val permissions = arrayOf(
        Manifest.permission.CAMERA,
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.INTERNET
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        setContentView(R.layout.activity_main)

        etServerIp = findViewById(R.id.etServerIp)
        btnStart = findViewById(R.id.btnStart)
        btnStop = findViewById(R.id.btnStop)
        openGlView = findViewById(R.id.surfaceView)

        if (!hasPermissions(permissions)) {
            ActivityCompat.requestPermissions(this, permissions, 100)
        } else {
            initStreamer()
        }

        // Read Config from Login
        val prefs = getSharedPreferences("SRTStreamer", Context.MODE_PRIVATE)
        val boatId = prefs.getString("BOAT_ID", "Unknown Boat")
        val srtUrl = prefs.getString("SRT_URL", null)
        val roomId = prefs.getString("ROOM_ID", null)
        
        Toast.makeText(this, "Logged in as $boatId", Toast.LENGTH_LONG).show()

        // Auto-fill SRT URL or show message
        if (srtUrl != null && srtUrl.isNotEmpty()) {
            // Parse SRT URL to get IP
            val srtHost = srtUrl.substringAfter("srt://").substringBefore(":")
            etServerIp.setText(srtHost)
            Toast.makeText(this, "✅ SRT URL configured", Toast.LENGTH_SHORT).show()
        } else {
            etServerIp.setText(BuildConfig.SRT_HOST)
            Toast.makeText(this, "⚠️ No room assigned. Assign device to room in Admin Console.", Toast.LENGTH_LONG).show()
        }
        
        btnStart.setOnClickListener {
            val ip = etServerIp.text.toString()
            if (ip.isNotBlank()) {
                // Start Foreground Service for background streaming
                val intent = Intent(this, StreamingService::class.java).apply {
                    action = StreamingService.ACTION_START
                    putExtra(StreamingService.EXTRA_SERVER_IP, ip)
                    putExtra(StreamingService.EXTRA_BOAT_ID, boatId ?: "Unknown")
                    putExtra(StreamingService.EXTRA_SRT_URL, srtUrl)
                }
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(intent)
                } else {
                    startService(intent)
                }
                
                // Also start local preview
                if (::srtStreamer.isInitialized) {
                    srtStreamer.startStream(ip)
                }
                
                btnStart.isEnabled = false
                btnStop.isEnabled = true
                etServerIp.isEnabled = false
                Toast.makeText(this, "🎥 Streaming in background", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Please enter Server IP", Toast.LENGTH_SHORT).show()
            }
        }

        btnStop.setOnClickListener {
            // Stop Foreground Service
            val intent = Intent(this, StreamingService::class.java).apply {
                action = StreamingService.ACTION_STOP
            }
            stopService(intent)
            
            // Stop local preview
            if (::srtStreamer.isInitialized) {
                srtStreamer.stopStream()
            }
            
            btnStart.isEnabled = true
            btnStop.isEnabled = false
            etServerIp.isEnabled = true
            Toast.makeText(this, "Stream Stopped", Toast.LENGTH_SHORT).show()
        }

        findViewById<Button>(R.id.btnSwitchCamera).setOnClickListener {
            if (::srtStreamer.isInitialized) {
                srtStreamer.switchCamera()
                Toast.makeText(this, "Switching Camera...", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 100 && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
            initStreamer()
        } else {
            Toast.makeText(this, "Permissions required for streaming", Toast.LENGTH_LONG).show()
        }
    }

    private fun initStreamer() {
        if (!::srtStreamer.isInitialized) {
            srtStreamer = SRTStreamer(this, openGlView)
            
            openGlView.holder.addCallback(object : android.view.SurfaceHolder.Callback {
                override fun surfaceCreated(holder: android.view.SurfaceHolder) {
                    srtStreamer.startPreview()
                }
                override fun surfaceChanged(holder: android.view.SurfaceHolder, format: Int, width: Int, height: Int) {}
                override fun surfaceDestroyed(holder: android.view.SurfaceHolder) {
                    srtStreamer.stopPreview()
                }
            })
            
            // If surface is already valid (e.g. rotation), start preview now
            if (openGlView.holder.surface.isValid) {
                srtStreamer.startPreview()
            }
        }
    }

    private fun hasPermissions(permissions: Array<String>): Boolean {
        return permissions.all {
            ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    override fun onResume() {
        super.onResume()
        // Set device status to online and register auto-disconnect
        val prefs = getSharedPreferences("SRTStreamer", Context.MODE_PRIVATE)
        val boatId = prefs.getString("BOAT_ID", "") ?: return
        
        val deviceRef = Firebase.database.reference.child("devices/$boatId")
        
        // Set online status
        deviceRef.child("status").setValue("online")
        deviceRef.child("lastSeen").setValue(ServerValue.TIMESTAMP)
        
        // Auto-set offline when connection drops
        deviceRef.child("status").onDisconnect().setValue("offline")
        deviceRef.child("lastSeen").onDisconnect().setValue(ServerValue.TIMESTAMP)
    }

    override fun onPause() {
        super.onPause()
        // Set device status to offline when app goes to background
        val prefs = getSharedPreferences("SRTStreamer", Context.MODE_PRIVATE)
        val boatId = prefs.getString("BOAT_ID", "") ?: return
        
        val deviceRef = Firebase.database.reference.child("devices/$boatId")
        deviceRef.child("status").setValue("offline")
        deviceRef.child("lastSeen").setValue(ServerValue.TIMESTAMP)
    }
}
