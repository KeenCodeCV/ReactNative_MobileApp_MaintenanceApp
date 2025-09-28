# MaintenanceApp (React Native + Expo)

**คลิปรีวิวการใช้งาน** https://youtu.be/AHhfh5tchNQ?si=jJMv0kURU53E9595
**แอปสำหรับ **แจ้งซ่อมครุภัณฑ์** แบ่ง 2 บทบาท  
**ผู้ใช้งาน (User):** แจ้งซ่อมแนบรูปหลายรูป, เลือกวัน, แก้ไข/ลบงาน, ดูรูปแบบเต็มจอ  
**ผู้ดูแล (Admin):** ดูทุกงาน, เปลี่ยนสถานะ (Pending / In Progress / Done / Cancelled) พร้อมวันที่เริ่มสถานะ (**statusSince**) — บันทึกแล้วรายการ **ถูกดันขึ้นบนสุดทันที**

---

## ภาพรวมฟีเจอร์

- แบบฟอร์มแจ้งซ่อม + เลือก **วัน/เดือน/ปี** (Date Picker)
- แนบ/ถ่ายรูปได้ **หลายรูป** (ลบได้ทั้งรูปใหญ่/รูปย่อ, เลือกรูปหลักจาก thumbnails)
- Popup/Alert ตกแต่งสวยงาม มีอนิเมชัน
- รายการของฉัน: ค้นหา, ดูรายละเอียด, แก้ไข (ข้อมูล + รูป), ลบ, ดูรูปแบบเต็มจอ
- ฝั่งแอดมิน: ค้นหา, เปลี่ยนสถานะ + ระบุ **statusSince**, บันทึกแล้ว **ขึ้นบนสุด**
- เก็บรูปภาพแบบ **Data URL (Base64)** ลงฐานข้อมูล JSON (ง่าย เร็ว เหมาะเดโม/ส่งงาน)

---

## เทคโนโลยีหลัก

- **Frontend:** React Native (Expo SDK 54)
- **Routing:** React Navigation (Native Stack + Bottom Tabs)
- **UI/Animation:** `react-native-animatable`, `react-native-modal`, `react-native-modal-datetime-picker`
- **รูปภาพ:** `expo-image-picker` (+ กล้องเว็บผ่าน `getUserMedia` ใน `WebCamModal`), บีบอัด/ย่อด้วย `expo-image-manipulator` (native)
- **HTTP:** `axios`
- **Backend (dev):** `json-server` + `db.json`

---

## เริ่มโปรเจกต์ (ตั้งแต่ศูนย์)

> ถ้ามีโปรเจกต์อยู่แล้วข้ามไปหัวข้อ **ติดตั้งไลบรารีที่ใช้** ได้เลย

```bash
# 1) สร้างโปรเจกต์ใหม่
npx create-expo-app@latest MaintenanceApp
cd MaintenanceApp
```

### ติดตั้งไลบรารีที่ใช้

```bash
# Networking
npm i axios

# React Navigation (stack + tabs)
npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler

# Animations & modal & date picker
npm i react-native-animatable react-native-modal react-native-modal-datetime-picker

# รูปภาพ (เลือกรูป/ถ่ายรูป) + (native resize/บีบอัด)
npx expo install expo-image-picker
npx expo install expo-image-manipulator   # ใช้บน native; ฝั่งเว็บมีโค้ด fallback แล้ว

# ไอคอน (มากับ Expo อยู่แล้ว)
# @expo/vector-icons
```

> **Reanimated (ถ้าใช้)**  
> SDK 54 ไม่จำเป็นต้องตั้งค่าเพิ่ม แต่ถ้าเปิดใช้เองให้เพิ่มปลั๊กอินใน `babel.config.js`  
> ```js
> module.exports = { presets: ['babel-preset-expo'], plugins: ['react-native-reanimated/plugin'] };
> ```

### ติดตั้ง/รันฐานข้อมูลจำลอง

```bash
# ติดตั้ง json-server แบบ local
npm i json-server

# เพิ่ม script ใน package.json
# "server": "json-server --watch db.json --port 3000"
```

สร้างไฟล์ `db.json` (ตัวอย่างเริ่มต้น):

```json
{
  "users": [
    { "id": 1, "username": "admin", "password": "admin123", "role": "admin" },
    { "id": 2, "username": "demo",  "password": "1234",     "role": "user"  }
  ],
  "reports": []
}
```

รันฐานข้อมูล:
```bash
npm run server
# หรือ
npx json-server --watch db.json --port 3000
```

---

## การตั้งค่า API (สำคัญ)

ไฟล์ `src/lib/api.js`:

```js
import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000', // Android Emulator
  ios:     'http://localhost:3000',// iOS Simulator / Web บนเครื่อง
  web:     'http://localhost:3000'
});

// อุปกรณ์จริง: เปลี่ยนเป็น IP คอมในวง LAN เดียวกัน เช่น
// const BASE_URL = 'http://192.168.1.23:3000';

export default axios.create({ baseURL: BASE_URL });
```

> **อุปกรณ์จริง (iPhone/Android):**  
> - โทรศัพท์และคอมต้องอยู่ **Wi-Fi เดียวกัน**  
> - ใช้ IP ของคอมพิวเตอร์แทน `localhost`  
> - บน Windows อาจต้องอนุญาต Firewall ให้ Node.js

---

## วิธีรันแอป

```bash
# 1) รัน json-server
npm run server

# 2) รัน Expo
npm start
# หรือ
npx expo start
```

เลือกแพลตฟอร์มที่ต้องการ (Android/iOS/Web)

> **เว็บ + กล้อง:** ต้องรันบน **secure context** (`https://` หรือ `http://localhost`) ไม่งั้นกล้องจะไม่ทำงาน

---

## โครงสร้างโปรเจกต์

```
MaintenanceApp/
├─ assets/
│  ├─ adaptive-icon.png
│  ├─ icon.png
│  ├─ logo.png
│  └─ splash-icon.png
├─ src/
│  ├─ components/
│  │  ├─ CustomAlert.js        # Popup สวยงาม + อนิเมชัน
│  │  ├─ DetailsModal.js       # โมดอลรายละเอียดงาน
│  │  ├─ FullImageViewer.js    # Modal ดูรูปเต็มจอ (เลื่อนซ้าย/ขวา)
│  │  ├─ InputField.js
│  │  ├─ ReportCard.js         # การ์ดรายการ + ปุ่ม ดู/แก้ไข/ลบ (+hint แตะเพื่อดูรูป)
│  │  ├─ Screen.js             # SafeArea + พื้นหลัง + padding
│  │  └─ WebCamModal.js        # กล้องเว็บ (getUserMedia)
│  ├─ context/
│  │  └─ AuthContext.js        # login/register/logout + เก็บ state user
│  ├─ lib/
│  │  └─ api.js                # axios baseURL
│  ├─ navigation/
│  │  ├─ AdminTabs.js
│  │  └─ UserTabs.js
│  └─ screens/
│     ├─ admin/
│     │  ├─ AdminDashboardScreen.js
│     │  ├─ AdminJobsScreen.js # เปลี่ยนสถานะ + statusSince | updatedAt → ดันขึ้นบนสุด
│     │  └─ AdminProfileScreen.js
│     └─ user/
│        ├─ UserHomeScreen.js  # แบบฟอร์มแจ้งซ่อม (หลายรูป/ลบรูป/ถ่ายรูป/เลือกจากคลัง)
│        ├─ UserReportsScreen.js# รายการของฉัน (ค้นหา/ดู/แก้ไข/ลบ/ดูรูปเต็มจอ)
│        ├─ UserProfileScreen.js
│        ├─ LoginScreen.js
│        └─ RegisterScreen.js
├─ App.js
├─ app.json
├─ db.json                     # ฐานข้อมูล json-server
├─ index.js
└─ package.json
```

---

## API ที่ใช้ (json-server)

| Method | Path                        | ใช้ทำอะไร |
|-------:|-----------------------------|-----------|
| GET    | `/users?username=&password=`| ตรวจสอบเข้าสู่ระบบ |
| POST   | `/users`                    | สมัครสมาชิก |
| GET    | `/reports?userId=...`       | ดึงรายการแจ้งซ่อมของผู้ใช้ |
| GET    | `/reports`                  | ดึงรายการทั้งหมด (แอดมิน) |
| POST   | `/reports`                  | สร้างงานใหม่ |
| PUT    | `/reports/:id`              | แก้ไขงาน/สถานะ |
| DELETE | `/reports/:id`              | ลบงาน |

---

## โครงสร้างข้อมูล

**users**
```json
{
  "id": "6bb4",
  "username": "demo",
  "password": "1234",
  "role": "user" // "user" | "admin"
}
```

**reports**
```json
{
  "id": "0965",
  "title": "คอมเสียเปิดไม่ติด",
  "code": "com-001",
  "room": "AD1234",
  "building": "AD",
  "description": "รายละเอียด...",
  "image": "data:image/jpeg;base64,...",      // รูปหลัก (เพื่อเข้ากันเวอร์ชันเก่า)
  "images": ["data:image/jpeg;base64,..."],   // หลายรูป (เวอร์ชันปัจจุบัน)
  "status": "Pending",                        // หรือ In Progress/Done/Cancelled
  "statusSince": "2025-09-28T09:35:00.000Z",  // วันที่เริ่มสถานะ
  "userId": "2",
  "createdAt": "2025-09-25T13:40:04.608Z",
  "updatedAt": "2025-09-27T10:15:00.000Z"     // ใช้จัดเรียงให้อยู่บนสุดหลังแก้ไข
}
```

> **การเก็บรูปภาพ**: เก็บเป็น **Data URL (Base64)** ในฟิลด์ `image`/`images`  
> เลือก/ถ่ายรูป → แปลง base64 (ฝั่ง native ใช้ `expo-image-manipulator` ย่อ/บีบอัด) → แนบใน JSON

---

## วิธีใช้งาน (สรุป)

1. รัน `json-server` และ `expo`
2. **ล็อกอิน** ด้วยบัญชีตัวอย่าง:  
   - admin / `admin123` (role: admin)  
   - demo / `1234` (role: user)
3. **User**: ไปหน้า “แจ้งซ่อม” → กรอกข้อมูล → เลือกวัน → เพิ่มรูป/ถ่ายรูป → ส่ง → Popup สำเร็จ  
   ไปหน้า “รายการของฉัน” → ค้นหา/ดู/แก้ไข/ลบ, แตะรูปเพื่อดูเต็มจอ
4. **Admin**: ไปหน้า “งานที่ซ่อม” → แตะ “แก้ไข” → เลือกสถานะ + วันเริ่มสถานะ → บันทึก  
   รายการจะ **ขึ้นบนสุดทันที**

---

## เคล็ดลับ & แก้ปัญหา

- **อุปกรณ์จริงเข้าไม่ได้ / ขึ้นรหัสผ่านผิด:**  
  - โทรศัพท์อยู่ Wi‑Fi เดียวกับคอมไหม  
  - เปลี่ยน `BASE_URL` เป็น `http://<IPคอม>:3000`  
  - อนุญาต Firewall ให้ Node.js
- **เว็บเปิดกล้องแล้วจอดำ:**  
  - ต้องรันบน `https://` หรือ `http://localhost` (secure context)  
  - ให้สิทธิ์กล้องในเบราว์เซอร์
- **Android Emulator ต่อเซิร์ฟเวอร์:** ใช้ `http://10.0.2.2:3000`
- **เรียงงานไม่ขึ้นบนสุดหลังแก้ไข:** ตรวจว่า `PUT /reports/:id` ใส่ `updatedAt` เป็น `new Date().toISOString()` แล้วหรือยัง

---

## สคริปต์ที่ใช้บ่อย (package.json)

```json
{
  "scripts": {
    "server": "json-server --watch db.json --port 3000",
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

---

## License
ธนกฤต ศรีจรุง walailak university
