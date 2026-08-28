---
layer: structure
tags: [fraud-detection, shieldai, boundaries]
created: 2025-11-05
links:
  - "[[structure/synthetic-fraud-detection/module-rule-engine]]"
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
  - "[[structure/synthetic-fraud-detection/module-case-manager]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-fraud-detection/module-rule-engine]] เป็นเจ้าของชุด rule ทั้งหมด (active rules, version history, override log) ส่วน [[structure/synthetic-fraud-detection/module-ml-scorer]] เป็นเจ้าของ model artifact และ feature pipeline เท่านั้น ไม่รู้จัก rule ใดๆ ที่ rule-engine บริหาร

[[structure/synthetic-fraud-detection/module-case-manager]] เป็น service เดียวที่รวม output จากทั้ง rule-engine และ ml-scorer เพื่อตัดสินใจว่าจะ block, review, หรือ allow event — เหตุผลที่ให้ case-manager ทำ decision aggregation คือต้องการ audit trail รวมศูนย์ที่เดียว ไม่กระจายอยู่หลาย service
