---
layer: structure
tags: [fraud-detection, shieldai, queue, async]
created: 2026-01-26
links:
  - "[[structure/synthetic-fraud-detection/module-signal-collector]]"
  - "[[structure/synthetic-fraud-detection/module-rule-engine]]"
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
  - "[[structure/synthetic-fraud-detection/module-velocity-tracker]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `signal.received`, `signal.scored`, `case.created`, `case.resolved`, `rule.updated`, `device.trust_changed` — [[structure/synthetic-fraud-detection/module-signal-collector]] เป็น publisher หลัก ส่วน [[structure/synthetic-fraud-detection/module-rule-engine]] และ [[structure/synthetic-fraud-detection/module-ml-scorer]] เป็น parallel consumer ที่ประเมิน signal เดียวกันพร้อมกันโดยไม่รอกัน

[[structure/synthetic-fraud-detection/module-velocity-tracker]] subscribe `signal.received` เพื่ออัปเดต counter แบบ real-time โดยไม่ต้องผ่าน case-manager — ออกแบบแบบนี้เพื่อให้ velocity data พร้อมใช้ทันทีที่ rule-engine หรือ ml-scorer ต้องการ โดยไม่เพิ่ม latency ของ critical path
