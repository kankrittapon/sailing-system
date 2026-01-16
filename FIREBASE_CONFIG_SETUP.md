# Firebase Central Config Setup

## Firebase Structure

Create this in Firebase Realtime Database:

```json
{
  "config": {
    "serverUrl": "http://192.168.1.37:3000",
    "apiBaseUrl": "http://192.168.1.37:3000/api",
    "liveKitUrl": "ws://192.168.1.37:7880",
    "srtHost": "192.168.1.37",
    "version": "1.0.0",
    "lastUpdated": 1705372800000
  }
}
```

## Setup Steps

### 1. Add Config to Firebase Console

1. Go to **Firebase Console** → **Realtime Database** → **Data**
2. Click **+** at root
3. Add node `config`:
   ```
   config/
     serverUrl: "http://192.168.1.37:3000"
     apiBaseUrl: "http://192.168.1.37:3000/api"
     liveKitUrl: "ws://192.168.1.37:7880"
     srtHost: "192.168.1.37"
     version: "1.0.0"
   ```

### 2. Update Server URL (When Needed)

**From Admin Console:**
- เปิด `/admin`
- แก้ไข Server URL ใน Firebase
- Android apps จะอัปเดตอัตโนมัติ

**From Firebase Console:**
- แก้ `config/serverUrl` ตรงๆ

### 3. Android App Behavior

1. **First Launch:**
   - ดึง Config จาก Firebase
   - Cache ไว้ใน SharedPreferences
   - ใช้ URL จาก Config

2. **Subsequent Launches:**
   - ใช้ Cache ก่อน (เร็ว)
   - Sync กับ Firebase ในพื้นหลัง
   - อัปเดตถ้ามีการเปลี่ยนแปลง

3. **Offline Mode:**
   - ใช้ Cache ล่าสุด
   - แจ้งเตือนถ้าไม่มี Cache

---

## Advantages

✅ **No Hardcode** - เปลี่ยน URL ได้ทันที
✅ **Centralized** - จัดการที่เดียว
✅ **Real-time** - อัปเดตทุก Device พร้อมกัน
✅ **Offline Support** - มี Cache fallback
✅ **Version Control** - ตรวจสอบ Version ได้

---

## Security Rules (Production)

```json
{
  "rules": {
    "config": {
      ".read": true,
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
    }
  }
}
```

- **Read**: ทุกคนอ่านได้ (สำหรับ Android apps)
- **Write**: เฉพาะ Admin เท่านั้น
