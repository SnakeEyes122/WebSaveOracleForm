# Security Policies (SECURITY.md)

นโยบายและแนวทางปฏิบัติด้านความปลอดภัยสำหรับโปรเจกต์

## 🔒 การยืนยันตัวตนและการเข้าถึง (Authentication & Authorization)
- ระบบใช้ **JWT (JSON Web Tokens)** ผ่าน Supabase Auth
- การเรียก API ทุกครั้งจาก Frontend ต้องมีการแนบ Token ไปใน `Authorization: Bearer <token>`
- Backend จะมี Middleware (`requireAuth`) สำหรับตรวจสอบว่า Token ถูกต้องและยังไม่หมดอายุหรือไม่ก่อนประมวลผลข้อมูล

## 📂 ความปลอดภัยของไฟล์ (File Storage Security)
- **การตั้งชื่อไฟล์:** ระบบหลีกเลี่ยงช่องโหว่ประเภท Directory Traversal (`../`) โดยไม่ใช้ชื่อไฟล์ดั้งเดิม (Original Name) ในการบันทึกลงดิสก์/Storage โดยตรง แต่จะสุ่มชื่อด้วย **UUID** และต่อท้ายด้วยนามสกุลไฟล์ที่ผ่านการตรวจสอบแล้วเท่านั้น
- **ประเภทไฟล์:** Backend จะทำการยืนยันนามสกุลไฟล์ (File Extension Validation) กับฐานข้อมูล `file_types` ก่อนเสมอ หากเป็นนามสกุลที่ไม่อนุญาต ระบบจะ Reject ทันที

## 🌐 ความปลอดภัยเครือข่าย (Network Security)
- **CORS (Cross-Origin Resource Sharing):** Backend มีการกำหนด CORS Origin ให้รับ Request เฉพาะจาก Domain ที่ได้รับอนุญาตเท่านั้น (ตั้งค่าผ่านตัวแปร `FRONTEND_URL` ใน `.env`)
- ไม่มีการส่งข้อมูล Credentials ของ Database ลงไปให้ Frontend (ตัวแปร Supabase Service Role Key เก็บซ่อนอย่างปลอดภัยใน Backend)
