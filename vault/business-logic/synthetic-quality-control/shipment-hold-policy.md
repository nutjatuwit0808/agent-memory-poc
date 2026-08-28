---
layer: business-logic
tags: [shipment, hold, policy]
created: 2025-10-25
links:
  - "[[structure/synthetic-quality-control/module-quarantine-manager]]"
---

# นโยบายการระงับ Shipment เมื่อพบปัญหา

ถ้า [[structure/synthetic-quality-control/module-quarantine-manager]] มี active hold สำหรับ batch ใดๆ ใน shipment นั้น ระบบจะ block การออก shipping document ทันที แม้ batch อื่นใน shipment จะผ่านการตรวจแล้วก็ตาม

สามารถขอแยก batch ที่ hold ออกจาก shipment แทนที่จะรอให้ hold ครบทุกอัน โดยต้องได้รับการอนุมัติจาก Sales Manager และ QC Manager พร้อมกัน เพื่อไม่ให้ฝ่ายขายปลด hold โดยไม่มีฝ่าย QC เห็นด้วย
