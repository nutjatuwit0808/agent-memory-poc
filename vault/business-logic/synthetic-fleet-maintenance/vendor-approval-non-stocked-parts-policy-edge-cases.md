---
layer: business-logic
tags: [vendor, procurement, edge-case]
created: 2025-11-03
links:
  - "[[business-logic/synthetic-fleet-maintenance/vendor-approval-non-stocked-parts-policy]]"
---

# กรณีฉุกเฉินที่ต้องซื้ออะไหล่จาก Vendor ที่ยังไม่ Approved

ถ้า vehicle breakdown กระทบ delivery SLA และอะไหล่ที่ต้องการไม่มีใน approved vendor list Operations Director สามารถออก emergency override เพื่อ approve vendor ชั่วคราวสำหรับ part นั้นครั้งเดียว โดยต้องบันทึกเหตุผลในระบบ

vendor ที่ได้รับ emergency approval จะถูกเพิ่มเข้า watchlist เพื่อให้ Purchasing Manager ประเมินว่าควร approve เป็น permanent หรือไม่ภายใน 30 วัน ถ้าไม่ดำเนินการภายใน 30 วัน จะถูก remove ออกจาก watchlist และ emergency approval ครั้งนั้นถือเป็น one-off

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fleet-maintenance/vendor-approval-non-stocked-parts-policy]] ("นโยบายการอนุมัติ Vendor สำหรับอะไหล่นอกสต็อก") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
