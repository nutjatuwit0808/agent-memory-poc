---
layer: business-logic
tags: [origin, retry, policy]
created: 2025-12-13
links:
  - "[[structure/synthetic-content-delivery/module-origin-puller]]"
  - "[[business-logic/synthetic-content-delivery/origin-retry-policy-edge-cases]]"
---

# นโยบาย Retry เมื่อ Origin Server ตอบ 5xx

เมื่อ [[structure/synthetic-content-delivery/module-origin-puller]] ได้รับ 5xx จาก origin server จะ retry ตาม exponential backoff สูงสุด `ORIGIN_MAX_RETRY` ครั้ง ก่อนถือว่า origin ล้มเหลวและ escalate ไปยัง fallback strategy ที่กำหนด

ความแตกต่างสำคัญ: 503 Service Unavailable retry ได้ปกติ แต่ 500 Internal Server Error ต้อง retry น้อยกว่าเพราะมักเป็นปัญหาถาวรที่การ retry ไม่ช่วยให้ดีขึ้น การ retry 5xx ซ้ำๆ โดยไม่มีขีดจำกัดจะกลายเป็น thundering herd บน origin ที่กำลังมีปัญหาอยู่แล้ว

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-content-delivery/origin-retry-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
