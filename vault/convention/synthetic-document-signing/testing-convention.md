---
layer: convention
tags: [testing, quality]
created: 2026-03-06
links:
  - "[[support-cases/synthetic-document-signing/case-4460]]"
  - "[[support-cases/synthetic-document-signing/case-6647]]"
---

# Testing Convention

## ทดสอบข้ามอุปกรณ์และ timezone

logic ที่เกี่ยวกับ signature-capture ต้องทดสอบกับอุปกรณ์รุ่นเก่าที่ยังมีลูกค้าใช้งานจริงเสมอ ไม่ใช่แค่อุปกรณ์รุ่นใหม่ (บทเรียนจาก [[support-cases/synthetic-document-signing/case-4460]]) และ logic ที่เกี่ยวกับเวลาต้องมี test case ข้าม timezone เสมอ (บทเรียนจาก [[support-cases/synthetic-document-signing/case-6647]])

## Idempotency test

ฟังก์ชันที่รับ webhook หรือถูกเรียกซ้ำได้จากภายนอกต้องมี test จำลอง request ซ้ำเสมออย่างน้อย 2 ครั้งติดกัน
