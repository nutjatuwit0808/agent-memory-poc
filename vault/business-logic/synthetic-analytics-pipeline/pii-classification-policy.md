---
layer: business-logic
tags: [pii, quality, policy]
created: 2026-08-04
links:
  - "[[structure/synthetic-analytics-pipeline/module-schema-registry]]"
  - "[[structure/synthetic-analytics-pipeline/module-data-quality-checker]]"
  - "[[business-logic/synthetic-analytics-pipeline/pii-classification-policy-edge-cases]]"
---

# นโยบายจำแนกและจัดการข้อมูล PII

ทุก column ของทุก dataset ต้องถูก classify ว่ามี PII หรือไม่ตอนลงทะเบียน schema ครั้งแรกใน [[structure/synthetic-analytics-pipeline/module-schema-registry]] — column ที่ classify เป็น PII จะถูกจำกัดสิทธิ์การเข้าถึงเป็น default (ต้องขอสิทธิ์เพิ่มเติมถึงจะ query ได้)

[[structure/synthetic-analytics-pipeline/module-data-quality-checker]] รัน pattern-matching เสริมทุกรอบเพื่อตรวจจับ PII ที่หลุดเข้ามาใน column ที่ไม่ได้ classify ไว้ว่าเป็น PII (เผื่อกรณีต้นทางเปลี่ยนความหมายของ field โดยไม่แจ้ง) เป็นการตรวจซ้ำสองชั้นไม่ใช่พึ่งการ classify ตอนแรกอย่างเดียว

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-analytics-pipeline/pii-classification-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
