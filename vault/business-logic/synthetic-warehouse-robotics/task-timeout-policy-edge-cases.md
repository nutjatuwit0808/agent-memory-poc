---
layer: business-logic
tags: [scheduling, timeout, edge-case]
created: 2025-12-02
links:
  - "[[business-logic/synthetic-warehouse-robotics/task-timeout-policy]]"
---

# Order หลายชิ้นที่หยิบสำเร็จบางส่วนก่อน Task ค้าง

สำหรับ order ที่มีหลาย order line และหยิบสำเร็จไปแล้วบางส่วนก่อนที่ line ที่เหลือจะค้าง ระบบจะไม่ mark ทั้ง order เป็น stuck — จะแยกเฉพาะ line ที่ค้างจริงออกมาให้ทีม warehouse-ops ดู ส่วน line ที่หยิบสำเร็จแล้วเดินหน้าไปแพ็คตามปกติ

เหตุผลที่แยกแบบนี้เพราะเคยมีกรณี order 8 ชิ้นค้างแค่ชิ้นเดียว แต่ทั้ง order ถูกหยุดรอจนลูกค้าปลายทางได้รับสินค้าช้าเกินจำเป็น ทั้งที่อีก 7 ชิ้นพร้อมส่งแล้ว

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-warehouse-robotics/task-timeout-policy]] ("นโยบาย Timeout ของ Pick Task (Business-level)") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
