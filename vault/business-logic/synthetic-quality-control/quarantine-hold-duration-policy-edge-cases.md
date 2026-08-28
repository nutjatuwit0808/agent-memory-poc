---
layer: business-logic
tags: [quarantine, hold, edge-case]
created: 2026-04-10
links:
  - "[[structure/synthetic-quality-control/module-batch-inspector]]"
  - "[[business-logic/synthetic-quality-control/quarantine-hold-duration-policy]]"
---

# กรณี Quarantine Hold ที่ Rework เสร็จแล้วแต่ยังไม่ได้ Release

ถ้า rework ผ่านการตรวจจาก [[structure/synthetic-quality-control/module-batch-inspector]] แล้ว แต่ผู้มีอำนาจยังไม่ release hold ภายใน 24 ชั่วโมงหลัง rework ผ่าน ระบบจะส่ง escalation alert ไปยัง QC Manager โดยอัตโนมัติ เพราะ hold ที่ค้างหลัง rework เสร็จมักเกิดจากลืม ไม่ใช่ตั้งใจ

ระบบจะไม่ release hold เองแม้ rework จะผ่านแล้ว — human decision ยังคงจำเป็นสำหรับ quarantine release ทุกกรณีโดยไม่มีข้อยกเว้น เพราะบางครั้งมีข้อมูลนอกระบบที่ต้องพิจารณาร่วมด้วย

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-quality-control/quarantine-hold-duration-policy]] ("นโยบายระยะเวลา Quarantine Hold") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
