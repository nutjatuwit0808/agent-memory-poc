---
layer: business-logic
tags: [inspection, checklist, edge-case]
created: 2026-02-14
links:
  - "[[business-logic/synthetic-fleet-maintenance/inspection-checklist-version-policy]]"
---

# กรณี Checklist Version ถูก Rollback หลัง Activate ไปแล้ว

ถ้า checklist version ใหม่มีปัญหาและต้อง rollback กลับ version เก่า การตรวจที่ทำด้วย version ใหม่ในช่วงที่ active จะ remain valid ไม่ต้องตรวจซ้ำ เพราะ checklist ใหม่มักเพิ่มรายการตรวจ (ไม่ใช่ลด) ทำให้การตรวจด้วย version ใหม่ครอบคลุมมากกว่า

ยกเว้นกรณีที่ rollback เกิดจากพบว่า checklist version ใหม่มี item ที่ผิดพลาดในแง่ safety-critical — กรณีนี้ Fleet Safety Officer ต้องตัดสินใจว่าจะ re-inspect รถที่ตรวจด้วย version ผิดหรือไม่ ไม่มีการตัดสินใจอัตโนมัติ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fleet-maintenance/inspection-checklist-version-policy]] ("นโยบายเวอร์ชัน Inspection Checklist") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
