---
layer: structure
tags: [fraud-detection, shieldai, gateway, api]
created: 2025-11-20
links:
  - "[[structure/synthetic-fraud-detection/module-signal-collector]]"
---

# API Gateway

event ทุกประเภท (account creation, login, promotion redemption, review submission) เข้ามาทาง gRPC streaming endpoint แยกต่างหาก ไม่ใช้ REST เพราะต้องการ throughput สูงและ latency ต่ำ API gateway แปลง JSON request เป็น protobuf แล้วส่งต่อให้ [[structure/synthetic-fraud-detection/module-signal-collector]] เป็น first hop

คำสั่งจาก analyst เช่น manual review, override rule, หรือ resolve case ใช้ REST ผ่าน admin portal — แยก endpoint จากตัวรับ signal เพราะ security model ต่างกัน (analyst มี auth token ต่างกับ client application)
