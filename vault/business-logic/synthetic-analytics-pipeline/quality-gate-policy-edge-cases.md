---
layer: business-logic
tags: [quality, edge-case]
created: 2026-02-16
links:
  - "[[business-logic/synthetic-analytics-pipeline/quality-gate-policy]]"
---

# ข้อยกเว้นเมื่อ Check ระดับ Critical Fail จาก Bug ของกฎเอง (ไม่ใช่ข้อมูลจริงมีปัญหา)

ถ้าทีมเจ้าของ dataset ยืนยันแล้วว่า check ที่ fail เกิดจาก bug ของกฎตรวจสอบเอง (เช่น regex ตรวจ PII เข้มเกินจนจับ pattern ที่ไม่ใช่ PII จริง) ไม่ใช่ข้อมูลมีปัญหาจริง สามารถ override ผ่านได้แม้จะเป็นระดับ critical แต่ต้องมี engineer ระดับ senior ขึ้นไปอนุมัติร่วมด้วยเสมอ ไม่ใช่แค่เจ้าของ dataset คนเดียว

การ override ระดับ critical ทุกครั้งต้องสร้าง ticket แก้ไขกฎตรวจสอบทันทีควบคู่ไปด้วย ไม่ปล่อยให้ override ครั้งเดียวแล้วจบ เพราะรอบถัดไปกฎเดิมจะ fail ซ้ำอีก

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-analytics-pipeline/quality-gate-policy]] ("นโยบาย Quality Gate ก่อนโหลดเข้า Warehouse") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
