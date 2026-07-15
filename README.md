# Momtech-Unicorn
## หน้าจอของแอปพลิเคชัน (จาก Figma)

### 1. Home 
* [x]  **Header:** แสดงการต้อนรับข้อมูลสัปดาห์การตั้งครรภ์ (e.g., Week 38 Pregnancy) และปุ่มแจ้งเตือน

* [x]  **Device Status:** แถบแสดงสถานะการเชื่อมต่อของแผ่นแปะ (Momentum Patch, Battery, Bluetooth)

* [x]  **Today's Health:** สรุปค่าสัญญาณชีพวันนี้ (Heart Rate, Baby Movement, Temperature, Stress)

* [x]  **AI Health Score & Recommendation:** คะแนนสุขภาพภาพรวม และคำแนะนำเบื้องต้นจาก AI

* [ ]  **Quick Action & Navigation:** ปุ่มลัดสำหรับเข้าถึงเมนูสำคัญ และ Bottom Navigation Bar

### 2. Live Monitor 
* [ ]  **Heart Rate Graph:** กราฟแสดงอัตราการเต้นของหัวใจแบบเรียลไทม์

* [ ]  **Baby Movement Counter:** ตัวนับจำนวนการดิ้นของทารกในครรภ์ และ Timeline เวลาที่ดิ้นล่าสุด

* [ ]  **Metrics:** การ์ดแสดงผลอุณหภูมิร่างกาย และระดับความเครียด (Stress Level) พร้อมปุ่ม Refresh/Export ข้อมูล

### 3. AI Analysis 
* [ ]  **Health Score & Risk Gauge:** หน้าปัดแสดงระดับความเสี่ยง (Risk Level) และคะแนนสุขภาพ 97%

* [ ]  **AI Summary:** สรุปผลภาพรวมในรูปแบบ Bullet points

* [ ]  **Detected Pattern:** สถานะของแต่ละตัวแปร (Normal/Stable/Low) พร้อมตัวทำนาย (Prediction) % ความปลอดภัยในการตั้งครรภ์

### 4. Profile 
* [ ]  **User Bio:** ข้อมูลผู้ป่วย (อายุ, จำนวนสัปดาห์ครรภ์, วันกำหนดคลอด, โรงพยาบาล, ชื่อคุณหมอเจ้าของไข้)

* [ ]  **Device Management:** เมนูจัดการอุปกรณ์สวมใส่ และปุ่ม Edit Profile / Logout

### 5. Health Report 
* [ ]  **Time Filter:** ปุ่มสลับดูข้อมูลรายวัน (Today), รายสัปดาห์ (Week), และรายเดือน (Month)

* [ ]  **Charts:** กราฟสรุปประวัติย้อนหลังของ Heart Rate, Movement, Temperature

* [ ]  **Doctor Report:** ความเห็นแพทย์ย้อนหลัง พร้อมปุ่ม Download PDF และ Share ให้คุณหมอ

### 6. Emergency (ระบบแจ้งเหตุฉุกเฉิน)
* [ ]  **SOS Button:** ปุ่มกดค้าง (Long Press) เพื่อยืนยันการโทรฉุกเฉิน

* [ ]  **Map Integration:** แสดงแผนที่และเส้นทางไปยังโรงพยาบาลที่ใกล้ที่สุด (เช่น ABC Hospital พร้อมเวลาเดินทาง)

* [ ]  **Hospital List:** รายชื่อโรงพยาบาลสำรองในบริเวณใกล้เคียงและระยะทาง

---

## Tech Stack & เทคโนโลยีที่ใช้

*   **Frontend Framework:** Vue 3 (Composition API) + Vite
*   **Routing:** Vue Router (สำหรับจัดการหน้าจอ Mobile ทั้ง 6 หน้า)
*   **State Management:** Pinia (สำหรับจำลองข้อมูลสัญญาณชีพและสถานะ SOS)
*   **Mobile Wrapper:** Capacitor (สำหรับ Build เป็นแอปมือถือจริง)

---

### 1. โคลนโปรเจกต์และติดตั้ง Dependencies
```bash
cd mom-link
npm install

