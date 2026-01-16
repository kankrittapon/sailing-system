// android_app/build.gradle.kts
plugins {
    id("com.android.application") version "8.2.0"
    id("org.jetbrains.kotlin.android") version "1.9.20"
}

android {
    namespace = "com.yart.livekit"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.yart.livekit"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.37:3000/api\"")
            buildConfigField("String", "SRT_HOST", "\"192.168.1.37\"")
        }
        debug {
            buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.37:3000/api\"")
            buildConfigField("String", "SRT_HOST", "\"192.168.1.37\"")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        viewBinding = true
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    
    // RootEncoder (Lightweight SRT Streamer)
    implementation("com.github.pedroSG94:RootEncoder:2.5.2")

    // LiveKit SDK (Optional: For room control/chat, not video transport in this pipeline)
    implementation("io.livekit:livekit-android:2.0.0")

    // Networking
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    
    // Firebase Realtime Database (for presence detection)
    implementation(platform("com.google.firebase:firebase-bom:32.7.0"))
    implementation("com.google.firebase:firebase-database-ktx")
}
