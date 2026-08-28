---
layer: structure
tags: [e-learning, learnpath, architecture, overview]
created: 2026-06-16
links:
  - "[[structure/synthetic-e-learning/module-course-catalog]]"
  - "[[structure/synthetic-e-learning/module-progress-tracker]]"
  - "[[structure/synthetic-e-learning/module-assessment-engine]]"
  - "[[structure/synthetic-e-learning/module-certificate-issuer]]"
  - "[[structure/synthetic-e-learning/module-instructor-scheduler]]"
  - "[[structure/synthetic-e-learning/module-compliance-deadline-monitor]]"
---

# ภาพรวมสถาปัตยกรรม LearnPath — ระบบ Learning Management System

LearnPath คือแพลตฟอร์ม Learning Management System (LMS) สำหรับองค์กรที่ต้องการจัดการการฝึกอบรมพนักงาน ครอบคลุมตั้งแต่การจัดการคอร์ส การติดตาม progress ของผู้เรียน การออก certificate และการจัดตารางสอนของ instructor ระบบเชื่อมต่อกับ HR system ของลูกค้าเพื่อดึงข้อมูลพนักงานและ sync สถานะ compliance การฝึกอบรม

ระบบแบ่งเป็น service ย่อยตามหน้าที่ ตั้งแต่ catalog ของคอร์สทั้งหมด การติดตามความคืบหน้าของผู้เรียนแบบ real-time การตรวจคำตอบแบบทดสอบ การออก certificate อัตโนมัติ และการจัดการ compliance deadline สำหรับ regulatory training ทีมพัฒนาให้ความสำคัญกับ data integrity ของ progress เป็นพิเศษเพราะการสูญหายของข้อมูลการเรียนกระทบต่อ certification ที่มีผลทางกฎหมาย

## Module หลัก

- **course-catalog** — จัดการข้อมูล metadata ของคอร์สทั้งหมดในระบบ ครอบคลุม course version management, ดู [[structure/synthetic-e-learning/module-course-catalog]]
- **progress-tracker** — บันทึกและติดตาม learning progress ของผู้เรียนทุกคนแบบ real-time ครอบคลุมตั้งแต่ก ดู [[structure/synthetic-e-learning/module-progress-tracker]]
- **assessment-engine** — จัดการแบบทดสอบและการตรวจคำตอบทั้งหมด ครอบคลุมการสร้าง quiz instance สำหรับผู้เรี ดู [[structure/synthetic-e-learning/module-assessment-engine]]
- **certificate-issuer** — ออก certificate ให้ผู้เรียนที่ผ่านเงื่อนไขทั้งหมด ได้แก่ content completion 100% ดู [[structure/synthetic-e-learning/module-certificate-issuer]]
- **instructor-scheduler** — จัดการตารางสอนของ instructor ทั้งหมด ครอบคลุมการนัดหมาย live session การ assign ดู [[structure/synthetic-e-learning/module-instructor-scheduler]]
- **compliance-deadline-monitor** — ติดตาม compliance training deadline ของพนักงานทุกคนตาม regulatory requirement ที ดู [[structure/synthetic-e-learning/module-compliance-deadline-monitor]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-e-learning/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-e-learning/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-e-learning/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-e-learning/database-schema]]
