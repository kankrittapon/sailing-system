# Android App Crash Fix Guide

## ปัญหา: แอปเปิดแล้วกด Start System → ปิดทันที

### สาเหตุ:
1. **Firebase Config ยังไม่มี** ใน Realtime Database
2. แอปพยายามดึง Config แต่ไม่เจอ → Crash

---

## วิธีแก้:

### 1. สร้าง Firebase Config (ใน Firebase Console)

1. เปิด **Firebase Console**: https://console.firebase.google.com
2. เลือก Project ของคุณ
3. ไปที่ **Realtime Database** → **Data**
4. คลิก **+** ที่ root
5. เพิ่ม node `config`:

```json
config/
  serverUrl: "http://192.168.1.37:3000"
  apiBaseUrl: "http://192.168.1.37:3000/api"
  liveKitUrl: "ws://192.168.1.37:7880"
  srtHost: "192.168.1.37"
  version: "1.0.0"
```

**หรือ Import JSON:**
```json
{
  "config": {
    "serverUrl": "http://192.168.1.37:3000",
    "apiBaseUrl": "http://192.168.1.37:3000/api",
    "liveKitUrl": "ws://192.168.1.37:7880",
    "srtHost": "192.168.1.37",
    "version": "1.0.0"
  }
}
```

---

### 2. ตรวจสอบ Firebase Rules

**Realtime Database Rules:**
```json
{
  "rules": {
    "config": {
      ".read": true,
      ".write": "auth != null"
    },
    "devices": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "rooms": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

**หมายเหตุ:** `config/.read: true` เพื่อให้ Android app อ่านได้โดยไม่ต้อง login

---

### 3. ติดตั้ง APK ใหม่

```bash
# APK Location:
android_app/build/outputs/apk/debug/SRTStreamer-debug.apk
```

1. Copy APK ไปยัง Android device
2. ติดตั้ง
3. เปิดแอป

---

### 4. ทดสอบ

1. **เปิดแอป** → ควรเห็นหน้า Login
2. **ใส่ Boat ID** (เช่น `YRAT01`)
3. **กด Start System**
4. **ดู Status:**
   - "Discovering server..." → ดึง Config จาก Firebase
   - "Registering device..." → ลงทะเบียนกับ Server
   - "Connected! Starting..." → สำเร็จ!

---

## Debug (ถ้ายัง Crash)

### ดู Logcat:
```bash
# เชื่อมต่อ Android device
adb logcat | grep -i "srtstreamer\|firebase\|crash"
```

### Error ที่อาจเจอ:

**1. "Failed to discover server"**
- ✅ เช็คว่า Firebase Config มีหรือไม่
- ✅ เช็ค Firebase Rules (`.read: true`)

**2. "Firebase error: ..."**
- ✅ เช็ค `google-services.json` ถูกต้อง
- ✅ เช็ค Internet connection

**3. "Connection failed: ..."**
- ✅ เช็ค Server URL ใน Firebase Config
- ✅ เช็ค Web Console รันอยู่หรือไม่

---

## สรุป Checklist:

- [ ] Firebase Config มีใน Realtime Database
- [ ] Firebase Rules อนุญาตให้อ่าน `config`
- [ ] `google-services.json` อยู่ใน `android_app/`
- [ ] APK build ใหม่และติดตั้งแล้ว
- [ ] Web Console รันอยู่ที่ `http://192.168.1.37:3000`

---

## ถ้าทำครบแล้วยังไม่ได้:

ส่ง Logcat output มาให้ช่วยดูครับ:
```bash
adb logcat -d > logcat.txt
```
