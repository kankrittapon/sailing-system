package com.yart.livekit

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.firebase.database.ktx.database
import com.google.firebase.ktx.Firebase
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.json.JSONObject
import java.io.IOException

class LoginActivity : AppCompatActivity() {

    private lateinit var etBoatId: com.google.android.material.textfield.TextInputEditText
    private lateinit var btnLogin: Button
    private lateinit var tvStatus: TextView
    private val client = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        etBoatId = findViewById(R.id.etBoatId)
        btnLogin = findViewById(R.id.btnLogin)
        tvStatus = findViewById(R.id.tvStatus)

        // Load saved boat ID
        val prefs = getSharedPreferences("SRTStreamer", Context.MODE_PRIVATE)
        etBoatId.setText(prefs.getString("BOAT_ID", ""))

        btnLogin.setOnClickListener {
            registerDevice()
        }
    }

    private fun getMacAddress(): String {
        return Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID) ?: "UNKNOWN_ID"
    }

    private fun registerDevice() {
        val boatId = etBoatId.text.toString().trim()

        if (boatId.isEmpty()) {
            Toast.makeText(this, "Please enter Boat ID", Toast.LENGTH_SHORT).show()
            return
        }

        btnLogin.isEnabled = false
        tvStatus.text = "Discovering server..."
        tvStatus.setTextColor(ContextCompat.getColor(this, android.R.color.darker_gray))

        // Step 1: Fetch server config from Firebase
        fetchServerConfig { apiBaseUrl ->
            if (apiBaseUrl == null) {
                runOnUiThread {
                    tvStatus.text = "Failed to discover server"
                    tvStatus.setTextColor(ContextCompat.getColor(this@LoginActivity, android.R.color.holo_red_light))
                    btnLogin.isEnabled = true
                }
                return@fetchServerConfig
            }

            // Step 2: Register device with discovered URL
            runOnUiThread {
                tvStatus.text = "Registering device..."
                tvStatus.setTextColor(ContextCompat.getColor(this@LoginActivity, android.R.color.darker_gray))
            }

            val macAddress = getMacAddress()
            val json = JSONObject().apply {
                put("boatId", boatId)
                put("macAddress", macAddress)
            }

            val requestBody = RequestBody.create(
                "application/json; charset=utf-8".toMediaTypeOrNull(),
                json.toString()
            )

            val request = Request.Builder()
                .url("$apiBaseUrl/device/register")
                .post(requestBody)
                .build()

                                }

                                tvStatus.text = "Connected! Starting..."
                                tvStatus.setTextColor(ContextCompat.getColor(this@LoginActivity, android.R.color.holo_green_light))
                                startMainActivity()
                            } catch (e: Exception) {
                                tvStatus.text = "JSON Error: ${e.message}"
                                tvStatus.setTextColor(ContextCompat.getColor(this@LoginActivity, android.R.color.holo_red_light))
                                btnLogin.isEnabled = true
                            }
                        } else {
                            val errorMsg = if (responseBody != null) {
                                try {
                                    JSONObject(responseBody).getString("error")
                                } catch (e: Exception) {
                                    "Registration failed: ${response.code}"
                                }
                            } else {
                                "Registration failed: ${response.code}"
                            }
                            tvStatus.text = errorMsg
                            tvStatus.setTextColor(ContextCompat.getColor(this@LoginActivity, android.R.color.holo_red_light))
                            btnLogin.isEnabled = true
                        }
                    }
                }
            })
        }
    }

    private fun fetchServerConfig(callback: (String?) -> Unit) {
        // Fetch server config from Firebase Realtime Database
        val database = Firebase.database
        val configRef = database.getReference("config")

        configRef.get().addOnSuccessListener { snapshot ->
            if (snapshot.exists()) {
                val apiBaseUrl = snapshot.child("apiBaseUrl").getValue(String::class.java)
                if (apiBaseUrl != null) {
                    // Cache config locally
                    val prefs = getSharedPreferences("SRTStreamer", Context.MODE_PRIVATE)
                    prefs.edit().apply {
                        putString("CACHED_API_URL", apiBaseUrl)
                        putString("CACHED_SERVER_URL", snapshot.child("serverUrl").getValue(String::class.java))
                        putString("CACHED_LIVEKIT_URL", snapshot.child("liveKitUrl").getValue(String::class.java))
                        putString("CACHED_SRT_HOST", snapshot.child("srtHost").getValue(String::class.java))
                        putLong("CONFIG_TIMESTAMP", System.currentTimeMillis())
                        apply()
                    }
                    callback(apiBaseUrl)
                } else {
                    useCachedConfig(callback)
                }
            } else {
                useCachedConfig(callback)
            }
        }.addOnFailureListener { error ->
            runOnUiThread {
                tvStatus.text = "Firebase error: ${error.message}"
                tvStatus.setTextColor(ContextCompat.getColor(this, android.R.color.holo_orange_light))
            }
            useCachedConfig(callback)
        }
    }

    private fun useCachedConfig(callback: (String?) -> Unit) {
        val prefs = getSharedPreferences("SRTStreamer", Context.MODE_PRIVATE)
        val cachedUrl = prefs.getString("CACHED_API_URL", null)

        if (cachedUrl != null) {
            runOnUiThread {
                tvStatus.text = "Using cached config..."
                tvStatus.setTextColor(ContextCompat.getColor(this, android.R.color.holo_orange_light))
            }
            callback(cachedUrl)
        } else {
            runOnUiThread {
                tvStatus.text = "No server config found. Please check Firebase."
                tvStatus.setTextColor(ContextCompat.getColor(this, android.R.color.holo_red_light))
            }
            callback(null)
        }
    }

    private fun startMainActivity() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
