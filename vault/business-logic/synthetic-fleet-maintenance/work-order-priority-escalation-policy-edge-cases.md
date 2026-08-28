---
layer: business-logic
tags: [work-order, escalation, edge-case]
created: 2026-06-07
links:
  - "[[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy]]"
---

# ข้อยกเว้นสำหรับ Work Order ที่รอ Parts จาก Vendor

work order ที่อยู่ใน status `pending_parts` และมี purchase request ค้างอยู่จะถูกหยุดนับ escalation clock ชั่วคราว เพราะการ escalate work order ที่รอของอยู่ไม่ช่วยอะไร — Fleet Manager ต้องการรู้แค่ว่าของจะมาเมื่อไหร่

ถ้า expected delivery date ของ purchase request เลยกำหนดไปแล้วโดยของยังไม่มา escalation clock จะกลับมาเดินใหม่และแจ้ง Fleet Manager พร้อมข้อมูล purchase request ที่ล่าช้า

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fleet-maintenance/work-order-priority-escalation-policy]] ("นโยบาย Escalation Priority ของ Work Order") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
