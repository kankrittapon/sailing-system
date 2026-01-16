# Firebase Index Setup

## Error:
```
Index not defined, add ".indexOn": "macAddress", 
for path "/devices", to the rules
```

## วิธีแก้:

### 1. เปิด Firebase Console
https://console.firebase.google.com

### 2. ไปที่ Realtime Database → Rules

### 3. เพิ่ม indexOn ใน Rules:

```json
{
  "rules": {
    "config": {
      ".read": true,
      ".write": "auth != null"
    },
    "devices": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["macAddress", "roomId"]
    },
    "rooms": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 4. คลิก "Publish"

---

## หรือใช้ Firebase CLI:

```bash
# ติดตั้ง Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only database
```

---

## ตรวจสอบ:
- ✅ Index ถูกสร้างแล้ว
- ✅ Query `orderByChild('macAddress')` ทำงานได้
- ✅ Registration API ไม่ error

---

## หมายเหตุ:
- `.indexOn` ช่วยให้ query เร็วขึ้น
- ต้องเพิ่มทุกครั้งที่ใช้ `orderByChild()`
