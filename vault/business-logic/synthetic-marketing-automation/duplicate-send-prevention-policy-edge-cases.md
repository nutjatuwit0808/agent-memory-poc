---
layer: business-logic
tags: [send, dedup, edge-case]
created: 2025-09-07
links:
  - "[[business-logic/synthetic-marketing-automation/duplicate-send-prevention-policy]]"
---

# ข้อยกเว้นเมื่อ Contact อยู่ใน Segment ซ้ำหลาย Segment ของ Campaign เดียวกัน

ถ้า campaign ผูกกับ segment ที่คำนวณซ้อนทับกัน (เช่น รวม segment ย่อยหลายอันเข้าด้วยกัน) contact คนเดียวที่ปรากฏในหลาย segment ย่อยจะถูก dedupe ให้เหลือส่งแค่ครั้งเดียวเสมอ โดยยึด segment แรกที่พบเป็นหลักในการนับสถิติ

การ dedupe นี้เกิดตอนสร้าง send job ครั้งแรกเท่านั้น ไม่ใช่ตรวจซ้ำทุก batch เพราะ segment membership ระหว่าง batch เดียวกันไม่ควรเปลี่ยนกลางทาง (คนละเรื่องกับ consent status ที่ต้องเช็คใหม่ทุก batch)

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-marketing-automation/duplicate-send-prevention-policy]] ("นโยบายป้องกันการส่งซ้ำ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
