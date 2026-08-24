---
layer: business-logic
tags: [requisition, approval, policy]
created: 2026-04-09
---

# นโยบายลำดับการอนุมัติเปิดตำแหน่งงาน

requisition ใหม่ต้องผ่านการอนุมัติตามลำดับ: hiring manager → finance (เช็ค budget) → HR business partner ตามลำดับนี้เท่านั้น ข้ามลำดับไม่ได้แม้ approver คนถัดไปจะอนุมัติมาก่อนก็ตาม

requisition ที่ค้างในสถานะ `pending_approval` เกิน `REQUISITION_STALE_DAYS` จะถูกแจ้งเตือนซ้ำไปยัง approver ที่ยังไม่ตัดสินใจทุกสัปดาห์จนกว่าจะมีการตัดสินใจ
