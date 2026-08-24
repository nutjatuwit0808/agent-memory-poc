---
layer: business-logic
tags: [send, throttle, policy]
created: 2026-05-23
links:
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[business-logic/synthetic-marketing-automation/send-rate-throttle-policy-edge-cases]]"
---

# นโยบาย Throttle อัตราการส่ง

[[structure/synthetic-marketing-automation/module-send-scheduler]] ส่งไม่เกิน `SEND_RATE_LIMIT_PER_MINUTE` ต่อนาทีเสมอ แบ่งเป็น batch ละ `SEND_BATCH_SIZE` เพื่อไม่ให้ ESP ปลายทางมองว่าเป็น traffic ผิดปกติจนเริ่ม throttle เราเองหรือ flag เป็น spam

ถ้า campaign มีผู้รับมากกว่าที่ส่งได้ภายใน 1 ชั่วโมงตาม rate limit ปัจจุบัน ระบบจะเตือนทีม marketing ตั้งแต่ตอน validate ก่อนกดส่งจริง ไม่ใช่ปล่อยให้ค้นพบตอนส่งจริงแล้วช้ากว่าคาด

## ทำไม rate limit ต่ำกว่าที่ ESP อนุญาตจริง

ค่า `SEND_RATE_LIMIT_PER_MINUTE` ตั้งไว้ต่ำกว่าเพดานที่ ESP อนุญาตจริงประมาณ 20% เสมอ เพื่อเผื่อ buffer สำหรับ traffic อื่นที่อาจใช้ ESP เดียวกันพร้อมกัน (เช่น transactional email จากระบบอื่น) และเพื่อไม่ให้การส่งของเราไปกระทบ sender reputation ของทั้งบริษัทถ้าคำนวณผิดพลาด

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-marketing-automation/send-rate-throttle-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
