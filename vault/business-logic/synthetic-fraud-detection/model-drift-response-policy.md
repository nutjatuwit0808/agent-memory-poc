---
layer: business-logic
tags: [ml, drift, policy]
created: 2026-06-30
links:
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
---

# นโยบายการตอบสนองต่อ ML Model Drift

[[structure/synthetic-fraud-detection/module-ml-scorer]] monitor metric เช่น precision, recall, และ false positive rate แบบ continuous ถ้า metric เหล่านี้เบี่ยงเบนจาก baseline เกิน 10% ติดต่อกันนาน 24 ชั่วโมง ถือว่าเกิด model drift และต้อง trigger emergency retrain

ระหว่างรอ retrain เสร็จ weight ของ ML score ใน combined score จะถูกปรับลดลงโดยอัตโนมัติ และ rule-engine score ได้น้ำหนักเพิ่มขึ้นเพื่อ compensate ลด exposure ระหว่างที่ model ไม่ reliable
