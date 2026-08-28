---
layer: business-logic
tags: [dunning, edge-case]
created: 2026-03-20
links:
  - "[[business-logic/synthetic-subscription-billing/dunning-retry-schedule-policy]]"
---

# ข้อยกเว้นเมื่อสาเหตุการล้มเหลวชัดเจนว่าแก้ไม่ได้

ถ้า payment processor ส่งรหัสข้อผิดพลาดที่บ่งชี้ชัดเจนว่าเป็นปัญหาถาวร (เช่น บัตรถูกยกเลิกแล้ว ไม่ใช่แค่ยอดเงินไม่พอ) ระบบจะข้ามการ retry ตามตารางปกติและแจ้งลูกค้าให้อัปเดตวิธีชำระเงินทันที แทนการเสียเวลา retry ที่รู้อยู่แล้วว่าจะไม่สำเร็จ

การตัดสินใจข้าม retry ใช้ error code จาก payment processor เป็นเกณฑ์เท่านั้น ไม่เดาจากจำนวนครั้งที่ล้มเหลวก่อนหน้า เพราะสาเหตุการล้มเหลวแต่ละครั้งอาจไม่เหมือนกัน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-subscription-billing/dunning-retry-schedule-policy]] ("นโยบายตารางเวลา Retry การเรียกเก็บเงิน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
