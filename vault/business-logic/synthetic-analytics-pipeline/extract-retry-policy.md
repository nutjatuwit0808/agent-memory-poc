---
layer: business-logic
tags: [ingest, retry, policy]
created: 2026-03-24
links:
  - "[[structure/synthetic-analytics-pipeline/module-ingest-connector]]"
  - "[[business-logic/synthetic-analytics-pipeline/extract-retry-policy-edge-cases]]"
---

# นโยบายการ Retry เมื่อดึงข้อมูลไม่สำเร็จ

เมื่อ [[structure/synthetic-analytics-pipeline/module-ingest-connector]] ดึงข้อมูลไม่สำเร็จ ระบบจะจัดหมวดผลลัพธ์เป็น `failed_partial` (ดึงได้บางส่วน มักเกิดจาก rate limit หรือ connection หลุดกลางทาง) หรือ `failed_full` (ดึงไม่ได้เลยตั้งแต่ต้น เช่น credential ผิดหรือต้นทางล่ม)

`failed_partial` จะถูก retry อัตโนมัติสูงสุด `EXTRACT_MAX_RETRY_ATTEMPTS` ครั้งโดยใช้ exponential backoff ก่อนถูกยกระดับเป็น `failed_full` โดยอัตโนมัติ เพื่อไม่ให้ connector ยิง request รัวใส่ต้นทางที่กำลังมีปัญหาซ้ำๆ

## ทำไมไม่ retry ไม่จำกัดครั้ง

การดึงพลาดซ้ำๆ จากต้นทางเดิมมักไม่ใช่ปัญหาชั่วคราว แต่เป็นสัญญาณว่า credential หมดอายุหรือต้นทางเปลี่ยน schema แบบที่ connector รับมือไม่ได้ การ retry ไม่จำกัดจะเปลืองเวลาของ nightly batch window โดยเปล่าประโยชน์ และหน่วง job อื่นที่รอคิวอยู่

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-analytics-pipeline/extract-retry-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
