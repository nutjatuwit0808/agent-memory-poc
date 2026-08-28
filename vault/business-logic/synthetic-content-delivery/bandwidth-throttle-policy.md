---
layer: business-logic
tags: [bandwidth, throttle, policy]
created: 2026-05-24
links:
  - "[[structure/synthetic-content-delivery/module-bandwidth-throttler]]"
  - "[[business-logic/synthetic-content-delivery/bandwidth-throttle-policy-edge-cases]]"
---

# นโยบาย Bandwidth Throttle Threshold

Tenant แต่ละรายมี monthly bandwidth quota ตามแผนที่สมัครไว้ — [[structure/synthetic-content-delivery/module-bandwidth-throttler]] tracking การใช้งานแบบ real-time และจะแจ้งเตือนที่ 90% ของ quota ก่อน throttle จริงที่ 100% เพื่อให้ tenant มีเวลา upgrade plan หรือปรับ traffic pattern ก่อนผู้ใช้ปลายทางได้รับผลกระทบ

Throttle ไม่ได้หมายความว่า block traffic ทั้งหมด — throttle ลด bandwidth limit ลงเหลือ 20% ของ normal capacity เพื่อให้บริการยังทำงานได้แต่ช้าลงมาก ซึ่งดีกว่าตัดการเชื่อมต่อทันทีและทำให้ผู้ใช้ปลายทาง error ทุกคนพร้อมกัน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-content-delivery/bandwidth-throttle-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
