# SRT Streaming Pipeline Issues

## ปัญหาที่พบ:

### 1. Android App ไม่ใช้ Dynamic IP
- **ปัญหา:** ใช้ `BuildConfig.SRT_HOST` (hardcoded)
- **ควรเป็น:** ใช้ IP จาก Firebase Config

### 2. FFmpeg Bridge ใช้ Ingress ID คงที่
- **ปัญหา:** `TWcNGriT4xNJ` สำหรับทุก Device
- **ควรเป็น:** แต่ละ Device มี Ingress ID ของตัวเอง

### 3. ไม่มี Ingress Creation Logic
- **ปัญหา:** ไม่มีโค้ดสร้าง Ingress สำหรับแต่ละ Device
- **ควรเป็น:** API สร้าง Ingress เมื่อ Device register

---

## สถาปัตยกรรมที่ถูกต้อง:

```
Android App (YRAT01)
    ↓ SRT Stream
    ↓ srt://SERVER_IP:8885
FFmpeg Bridge (Port 8885)
    ↓ Convert SRT → RTMP
    ↓ rtmp://ingress:1935/live/YRAT01_INGRESS_ID
LiveKit Ingress
    ↓ Ingest to Room
    ↓ Room: room-1768535118540
LiveKit Server
    ↓ WebRTC
Web Console Viewer
```

---

## วิธีแก้:

### Option 1: Dynamic Ingress (แนะนำ) ✅
1. API สร้าง Ingress สำหรับแต่ละ Device
2. Return Ingress URL + Stream Key
3. Android stream ไปที่ URL นั้น
4. FFmpeg ไม่ต้องใช้ (Ingress รับ SRT ได้เอง)

### Option 2: Static SRT Port per Device
1. แต่ละ Device มี SRT Port ของตัวเอง (8885, 8886, 8887...)
2. FFmpeg Bridge หลายตัว
3. แต่ละ FFmpeg ส่งไปยัง Ingress ของ Device นั้น

### Option 3: LiveKit Direct (ง่ายที่สุด) ⭐
1. Android ใช้ LiveKit SDK แทน SRT
2. Connect ตรงไปยัง LiveKit
3. ไม่ต้องใช้ FFmpeg Bridge
4. ไม่ต้องใช้ Ingress

---

## แนะนำ: Option 3 - LiveKit Direct

**ข้อดี:**
- ✅ ไม่ต้อง FFmpeg
- ✅ ไม่ต้อง Ingress
- ✅ Latency ต่ำ
- ✅ Quality ดีกว่า
- ✅ มี SDK สำเร็จรูป

**ข้อเสีย:**
- ❌ ต้องแก้โค้ด Android ใหม่

---

## ต้องการให้แก้แบบไหน?

1. **LiveKit Direct** (แนะนำ) - ใช้ LiveKit SDK
2. **Dynamic Ingress** - สร้าง Ingress ต่อ Device
3. **Keep SRT** - แก้ให้ SRT pipeline ทำงาน
