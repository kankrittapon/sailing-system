package com.yart.livekit

import android.content.Context
import android.view.SurfaceView
import com.pedro.library.view.OpenGlView
import com.pedro.library.generic.GenericCamera2
import com.pedro.common.ConnectChecker
import com.pedro.common.VideoCodec

class SRTStreamer(private val context: Context, private val openGlView: OpenGlView) : ConnectChecker {

    private var genericCamera2: GenericCamera2? = null

    init {
        genericCamera2 = GenericCamera2(openGlView, this)
    }

    fun startStream(serverIp: String) {
        if (genericCamera2?.isStreaming == false) {
            // Prepare Video (1280x720, 30fps, 2Mbps)
            // prepareVideo(width, height, fps, bitrate, iFrameInterval, rotation, avcProfile, avcProfileLevel)
            if (genericCamera2?.prepareAudio() == true && 
                genericCamera2?.prepareVideo(1280, 720, 30, 2000 * 1024, 2, 0) == true) { // 2Mbps
                
                // Start SRT Stream
                // URL Format: srt://ip:port?latency=2000
                // We add latency=2000 (2s) to match the server's buffer for stability
                val srtUrl = "srt://$serverIp:8885?latency=2000"
                genericCamera2?.startStream(srtUrl)
            } else {
                // Handle configuration error
            }
        }
    }

    fun stopStream() {
        if (genericCamera2?.isStreaming == true) {
            genericCamera2?.stopStream()
        }
    }
    
    fun startPreview() {
        if (openGlView.holder.surface.isValid) {
             genericCamera2?.startPreview()
        }
    }
    
    fun stopPreview() {
        genericCamera2?.stopPreview()
    }

    fun switchCamera() {
        genericCamera2?.switchCamera()
    }

    // ConnectChecker Interfaces
    override fun onConnectionStarted(url: String) {}
    override fun onConnectionSuccess() {}
    override fun onConnectionFailed(reason: String) {}
    override fun onNewBitrate(bitrate: Long) {}
    override fun onDisconnect() {}
    override fun onAuthError() {}
    override fun onAuthSuccess() {}
}
