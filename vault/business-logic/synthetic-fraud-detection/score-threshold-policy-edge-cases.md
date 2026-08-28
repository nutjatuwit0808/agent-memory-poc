---
layer: business-logic
tags: [scoring, threshold, new-account, edge-case]
created: 2025-12-08
links:
  - "[[structure/synthetic-fraud-detection/module-device-fingerprinter]]"
  - "[[business-logic/synthetic-fraud-detection/score-threshold-policy]]"
---

# ข้อยกเว้น Score Threshold สำหรับ Account สมัครใหม่ภายใน 24 ชั่วโมง

account ที่สมัครใหม่ไม่เกิน 24 ชั่วโมงได้รับ threshold ที่ strict กว่า: score ≥ 60 → block ทันที เพราะยังไม่มีประวัติการใช้งานพอที่จะให้ ML model ประเมินได้แม่นยำ และ fraudster มักใช้บัญชีใหม่เพื่อหลีกเลี่ยงการตรวจจับ

ถ้า account ใหม่มาจาก device ที่มี trust score > 90 (ดู [[structure/synthetic-fraud-detection/module-device-fingerprinter]]) จะได้รับ threshold ปกติ เพราะ device trust บ่งบอกว่าเป็น existing customer ที่สมัคร account ใหม่ ไม่ใช่ fraudster จริง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fraud-detection/score-threshold-policy]] ("นโยบาย Score Threshold สำหรับ Block/Review/Allow") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
