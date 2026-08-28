---
layer: business-logic
tags: [tier, downgrade, edge-case]
created: 2025-09-05
links:
  - "[[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]]"
---

# Grace Period ซ้อนกัน (Multi-Level Downgrade)

สมาชิกที่ลดจาก Platinum ลงมาอาจถึง threshold ต่ำกว่า Gold ด้วยในคราวเดียว ระบบจะให้ grace period สำหรับ Platinum ก่อน ถ้าพ้น grace period แล้วยังต่ำกว่า Gold threshold จึงให้ grace period ของ Gold ต่อ ไม่รัน grace period สองชั้นพร้อมกัน เพราะ stack สองชั้นในครั้งเดียวทำให้สมาชิกสับสนเรื่องสถานะ

ข้อยกเว้น: ถ้าสมาชิกยืนยันว่าต้องการ downgrade เองและสละสิทธิ์ grace period (ผ่านหน้า account settings) ระบบจะ downgrade ทันทีโดยไม่รอ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-loyalty-rewards/tier-downgrade-grace-policy]] ("นโยบาย Grace Period เมื่อ Tier ลดระดับ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
