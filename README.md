# Momtech-Unicorn

แอปพลิเคชันติดตามสุขภาพครรภ์ (Maternal Health Monitoring)

## โครงสร้างโปรเจกต์

```
Momtech-Unicorn/
├── backend/                    # Express + SQLite API Server
│   ├── package.json
│   ├── db.sqlite              # SQLite Database
│   └── src/
│       ├── index.js           # Express Server (port 3000)
│       ├── db/
│       │   ├── connection.js  # Database connection
│       │   └── init.js        # Schema + Demo data
│       └── routes/
│           ├── userRoutes.js       # /api/users
│           ├── deviceRoutes.js      # /api/devices
│           ├── healthLogRoutes.js  # /api/health-logs
│           └── contactRoutes.js    # /api/contacts
│
└── mom-link/                  # Vue 3 Frontend
    ├── package.json
    ├── src/
    │   ├── api/index.js       # API client
    │   ├── stores/            # Pinia stores
    │   │   ├── user.js       # User profile
    │   │   ├── devices.js    # Bluetooth devices
    │   │   ├── health.js     # Health logs
    │   │   └── contacts.js   # Emergency contacts
    │   ├── views/            # Vue pages
    │   │   ├── HomeView.vue
    │   │   ├── MonitorView.vue
    │   │   ├── AIAnalysisView.vue
    │   │   ├── ProfileView.vue
    │   │   ├── HealthReportView.vue
    │   │   ├── EmergencyView.vue
    │   │   └── BluetoothView.vue
    │   └── router/index.js
    └── dist/                  # Built frontend
```

## Backend API

### Database Schema

| Table | Description |
|-------|-------------|
| `users` | โปรไฟล์ผู้ใช้ + ข้อมูลครรภ์ |
| `bluetooth_devices` | อุปกรณ์ Bluetooth |
| `health_logs` | ข้อมูลสุขภาพจากอุปกรณ์ |
| `emergency_contacts` | ผู้ติดต่อฉุกเฉิน |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | ดึงข้อมูลผู้ใช้ |
| PUT | `/api/users/:id` | แก้ไขโปรไฟล์ |
| POST | `/api/users/register` | ลงทะเบียน |
| POST | `/api/users/login` | เข้าสู่ระบบ |
| GET | `/api/devices?user_id=X` | ดึงรายการอุปกรณ์ |
| POST | `/api/devices` | เพิ่มอุปกรณ์ |
| PUT | `/api/devices/:id/set-active` | เลือกอุปกรณ์ที่ใช้ |
| DELETE | `/api/devices/:id` | ลบอุปกรณ์ |
| GET | `/api/health-logs?user_id=X` | ดึงข้อมูลสุขภาพ |
| GET | `/api/health-logs/latest` | ดึงข้อมูลล่าสุด |
| POST | `/api/health-logs` | เพิ่มข้อมูลสุขภาพ |
| GET | `/api/health-logs/export?format=csv` | Export CSV |
| GET | `/api/contacts?user_id=X` | ดึงผู้ติดต่อฉุกเฉิน |
| POST | `/api/contacts` | เพิ่มผู้ติดต่อ |
| DELETE | `/api/contacts/:id` | ลบผู้ติดต่อ |

## Features ที่เพิ่มมา

### 1. Backend API (Express + SQLite)
- RESTful API สำหรับ users, devices, health-logs, contacts
- Authentication (register/login)
- Export CSV สำหรับข้อมูลสุขภาพ

### 2. Bluetooth Device System
- รองรับการเพิ่มอุปกรณ์ Bluetooth (ทั้งจริงและ Demo)
- **Demo Devices:**
  - ❤️ Heart Rate Monitor Pro
  - 🌡️ Temp Sensor Mini
  - 👶 Baby Movement Detector
  - ⚠️ Emergency Test Device (ค่าผิดปกติ)

### 3. Emergency Alert System
- เมื่อเลือก Emergency Test Device จะขึ้น Alert จอแดงกระพริบ
- แสดงค่าที่ผิดปกติ (HR 170-200 bpm, Temp 37.8-39°C, Movement 0-2)
- ปุ่ม "Go to Emergency" และ "Dismiss"
- หน้า Emergency มี:
  - ปุ่ม SOS พร้อม Animation
  - ปุ่มโทรโรงพยาบาลด่วน
  - รายชื่อ รพ. + ปุ่มโทร
  - ผู้ติดต่อฉุกเฉินจาก Database

### 4. Profile Management
- แก้ไขโปรไฟล์ได้ (ชื่อ, อายุ, สัปดาห์ครรภ์, วันกำหนดคลอด, โรงพยาบาล, คุณหมอ, หมู่เลือด, ภูมิแพ้)
- Export ข้อมูลสุขภาพเป็น CSV
- จัดการ Bluetooth Devices

### 5. Share to Doctor
- กดแชร์รายงานสุขภาพผ่าน Web Share API หรือ Copy to Clipboard

## วิธีติดตั้งและรัน

### 1. Backend
```bash
cd backend
npm install
npm run db:init   # สร้าง Database + Demo User
npm run dev       # รัน Server (port 3000)
```

**Demo User:**
- ID: 1
- Email: sarah@example.com
- Password: password

### 2. Frontend
```bash
cd mom-link
npm install
npm run dev       # รัน Vite Dev Server (port 5173)
```

### 3. Build Production
```bash
cd mom-link
npm run build     # Build ไปที่ dist/
```

## การใช้งาน Demo

1. **เพิ่ม Demo Device:**
   - ไปที่ Profile > Bluetooth Devices
   - กดปุ่ม Demo Devices ที่ต้องการ

2. **ทดสอบ Emergency:**
   - เพิ่ม "⚠️ Emergency Test Device"
   - กด Select ที่ device นั้น
   - จะเห็น Alert จอแดงกระพริบ
   - กด "Go to Emergency" เพื่อไปหน้าฉุกเฉิน
   - กดปุ่ม "📞 Call Hospital" เพื่อโทร

3. **ดูข้อมูลสุขภาพ:**
   - ไปที่ Home หรือ Monitor
   - ดูค่าต่างๆ จาก Demo Device

4. **แก้ไขโปรไฟล์:**
   - ไปที่ Profile
   - กด ✏️ เพื่อแก้ไข

5. **Export ข้อมูล:**
   - ไปที่ Profile
   - กด "📥 Export Data"

## Tech Stack

- **Frontend:** Vue 3 (Composition API) + Vite + Pinia + Vue Router
- **Backend:** Node.js + Express + better-sqlite3
- **Database:** SQLite
- **Mobile Wrapper:** Capacitor (สำหรับ Build เป็นแอปมือถือ)

---

## Changelog

### v0.2.0 - Backend + Database Integration
- เพิ่ม Express + SQLite Backend
- RESTful API สำหรับ Users, Devices, Health Logs, Contacts
- เปลี่ยนจาก mockup data เป็น API จริง
- เพิ่ม Bluetooth Device Management
- เพิ่ม Emergency Alert System
- เพิ่ม Profile Edit + Export
- เพิ่ม Share to Doctor
