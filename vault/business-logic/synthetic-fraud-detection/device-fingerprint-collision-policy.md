---
layer: business-logic
tags: [device, fingerprint, collision, policy]
created: 2026-01-14
links:
  - "[[structure/synthetic-fraud-detection/module-device-fingerprinter]]"
---

# นโยบายเมื่อเกิด Device Fingerprint Collision

device fingerprint collision เกิดเมื่อสองอุปกรณ์ต่างกันให้ fingerprint hash เดียวกัน ซึ่งทำให้ trust score ปนกัน [[structure/synthetic-fraud-detection/module-device-fingerprinter]] ตรวจจับ collision โดย monitor behavioral divergence ระหว่าง session ที่ fingerprint เหมือนกัน

เมื่อตรวจพบ collision ระบบจะสร้าง new fingerprint variant ให้แต่ละ device โดยใช้ additional attribute เพิ่มเติม และ migrate trust score แบบ conservative (ใช้ค่าต่ำสุดของทั้งสอง) เพื่อความปลอดภัย
