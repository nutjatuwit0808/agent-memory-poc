---
layer: structure
tags: [recruitment-ats, talentflow, gateway, api]
created: 2026-07-27
---

# API Gateway

คำสั่งจาก recruiter ผ่านหน้าเว็บ (สร้าง requisition, ย้าย candidate ไปขั้นถัดไป, อนุมัติ offer) เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่ง route ไปยัง service ที่เกี่ยวข้องตามประเภทคำขอ

webhook จากระบบภายนอก (background check vendor, resume upload จาก job board) ไม่ผ่าน API gateway ตัวเดียวกับที่ recruiter ใช้ — เข้าทาง webhook endpoint แยกที่มี retry/signature verification เฉพาะ เพราะระบบภายนอกแต่ละเจ้ามีพฤติกรรม retry และ timeout ไม่เหมือนกัน การแยก endpoint ทำให้ debug ปัญหาจากฝั่งไหนง่ายกว่า
