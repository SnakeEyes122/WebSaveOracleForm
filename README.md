# Oracle Forms Repo (WebSaveFile)

ระบบจัดการไฟล์และควบคุมเวอร์ชัน (File Management & Version Control System) ที่ออกแบบมาเพื่อใช้จัดเก็บ แจกจ่าย และควบคุมเวอร์ชันของไฟล์ (โดยเฉพาะ Oracle Forms) อย่างเป็นระบบ

## 🌟 ฟีเจอร์หลัก (Key Features)
- **ระบบจัดการเวอร์ชัน (Version Control):** อัปโหลดไฟล์เวอร์ชันใหม่ทับไฟล์เดิมได้ โดยระบบจะรันเลขเวอร์ชันให้อัตโนมัติ (เช่น 1.0 -> 1.1)
- **การจัดการไฟล์ด้วย UUID:** รองรับชื่อไฟล์ภาษาไทยและภาษาอื่นๆ อย่างสมบูรณ์แบบโดยไม่มีปัญหาเรื่อง Encoding
- **ระบบการแจ้งเตือน (Notifications):** แจ้งเตือนเมื่อมีการอัปเดตไฟล์แบบเรียลไทม์ (Polling)
- **ระบบตรวจสอบย้อนหลัง (Audit Logs):** บันทึกทุกกิจกรรมที่เกิดขึ้นในระบบ
- **การจัดการสิทธิ์ (Authentication):** ใช้ Supabase Auth ปลอดภัยและได้มาตรฐาน

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)
### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **Icons:** Lucide React
- **Deployment:** Vercel

### Backend
- **Framework:** Node.js + Express.js (TypeScript)
- **File Upload:** Multer
- **Deployment:** Render

### Database & Storage
- **Provider:** Supabase (PostgreSQL + Supabase Storage)

## 🚀 การติดตั้งและรันโปรเจกต์ (Local Setup)

### 1. การตั้งค่า Backend
```bash
cd backend
npm install
npm run build
npm run start
```
*(จำเป็นต้องตั้งค่าไฟล์ `.env` สำหรับ Supabase URL, Service Key และ Port)*

### 2. การตั้งค่า Frontend
```bash
cd frontend
npm install
npm run dev
```
*(จำเป็นต้องตั้งค่าไฟล์ `.env` สำหรับ `VITE_API_URL` และค่าคอนฟิกของ Supabase)*

## 🌐 การนำขึ้นใช้งานจริง (Deployment)
- **Frontend (Vercel):** กำหนดค่า Root Directory เป็น `frontend` และตั้งค่า Build Command เป็น `npm run build`
- **Backend (Render):** ตั้งค่าให้ Build เป็น `npm run build` และ Start Command เป็น `npm run start`
