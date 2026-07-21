# AI Agent Rules (AGENTS.md)

เอกสารนี้รวบรวมกฎและข้อบังคับสำหรับ AI Agent (เช่น Antigravity) ที่เข้ามาทำงานใน Repository นี้ เพื่อให้มาตรฐานโค้ดไปในทิศทางเดียวกัน

## 🗣 1. การสื่อสาร (Communication)
- **ภาษาหลัก:** ให้สื่อสารกับ User ด้วย **ภาษาไทย** เป็นหลัก 
- **ความกระชับ:** อธิบายให้เข้าใจง่าย ไม่เยิ่นเย้อ หากเป็นเรื่องเทคนิคให้ยกตัวอย่างประกอบ

## 🏗 2. แนวทางการเขียนโค้ด (Coding Standards)
### Frontend (React/Vite)
- ใช้ **Tailwind CSS** ในการตกแต่ง UI ห้ามเขียน CSS ธรรมดานอกเหนือจากที่จำเป็น
- หากมีการสร้าง Modal/Popup **ต้องใช้ `React Portal` (`createPortal`)** ทุกครั้ง เพื่อป้องกันปัญหา Z-Index โดนทับจาก Sidebar หรือ Header
- ให้ใช้ `lucide-react` สำหรับไอคอนทั้งหมด

### Backend (Express/Node.js)
- ใช้ **TypeScript** อย่างเคร่งครัด
- ห้ามเขียนหรืออ่านไฟล์ลงระบบไฟล์ (Local File System) โดยตรง ให้ใช้ **Supabase Storage** เท่านั้น
- การจัดการชื่อไฟล์สำหรับ Storage (Physical File Name) ให้ใช้ **UUID** (`crypto.randomUUID()`) เสมอ เพื่อแก้ปัญหาตัวอักษรภาษาไทยหรืออักขระพิเศษ (Invalid Key Error) ส่วนชื่อไฟล์ดั้งเดิม (Original Name) ให้เก็บไว้ใน Database (PostgreSQL)

## 🔧 3. การจัดการ Tool / Command
- หากรัน Backend ใหม่อย่าลืมรัน `npm run build` ก่อนเสมอหากมีการแก้ไขโค้ด TypeScript
- หากต้องการดูหน้าเว็บ ห้ามข้ามขั้นตอนการ Build Frontend (ยกเว้นรันผ่าน `vite dev`)
