# สร้าง Admin User และ Role

## ขั้นตอน

### 1. เปิด Email/Password Authentication
1. [Firebase Console](https://console.firebase.google.com) → **yrat-livekit**
2. **Authentication** → **Sign-in method**
3. เปิด **Email/Password**

### 2. สร้าง Admin User
1. **Authentication** → **Users** → **Add user**
2. Email: `admin@yrat.com`
3. Password: `admin123456`
4. คัดลอก **UID** (เช่น `abc123xyz`)

### 3. เพิ่ม Admin Role ใน Realtime Database
1. **Realtime Database** → **Data**
2. คลิก **+** ที่ Root
3. สร้าง Node:
   ```
   admins/
     {UID}/
       role: "admin"
       email: "admin@yrat.com"
       createdAt: {timestamp}
   ```

**ตัวอย่าง:**
```json
{
  "admins": {
    "abc123xyz": {
      "role": "admin",
      "email": "admin@yrat.com",
      "createdAt": 1705372800000
    }
  }
}
```

### 4. Login
1. เปิด `http://localhost:3000` → Redirect ไป `/login` อัตโนมัติ
2. Login ด้วย Email/Password
3. ระบบจะเช็ค Role → ถ้าเป็น Admin → เข้า `/admin` ได้

---

## หมายเหตุ

- **ต้องมี Role ใน RTDB** ถึงจะ Login ได้
- ถ้า Login แล้วขึ้น "Access denied" → ยังไม่ได้เพิ่ม Role ใน RTDB
- Google Login ก็ต้องมี Role เหมือนกัน
