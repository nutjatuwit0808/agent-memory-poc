---
layer: business-logic
tags: [ingest, retry, edge-case]
created: 2026-04-27
links:
  - "[[business-logic/synthetic-analytics-pipeline/quality-gate-policy]]"
  - "[[business-logic/synthetic-analytics-pipeline/extract-retry-policy]]"
---

# ข้อยกเว้นของนโยบาย Retry การดึงข้อมูล

ถ้าดึงข้อมูลไม่สำเร็จเพราะ credential ผิดหรือหมดอายุ (ไม่ใช่ rate limit หรือ connection error) ระบบจะไม่ retry เลยแม้แต่ครั้งเดียว เพราะการลอง credential เดิมซ้ำไม่มีประโยชน์ — จะส่งตรงไป `failed_full` ทันทีเพื่อแจ้งทีมเจ้าของ source ให้ต่ออายุ credential

source ที่ถูก flag ว่าเปลี่ยน schema แบบ breaking (ดู [[business-logic/synthetic-analytics-pipeline/quality-gate-policy]]) ก็ไม่เข้าเงื่อนไข retry เช่นกัน เพราะการดึงซ้ำด้วย schema เดิมที่คาดไว้จะยิ่งทำให้ transform ล้มเหลวต่อเนื่อง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-analytics-pipeline/extract-retry-policy]] ("นโยบายการ Retry เมื่อดึงข้อมูลไม่สำเร็จ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
