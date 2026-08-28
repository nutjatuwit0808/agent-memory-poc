---
layer: business-logic
tags: [pii, privacy, compliance, policy]
created: 2026-07-21
links:
  - "[[structure/synthetic-customer-segmentation/module-segment-builder]]"
  - "[[business-logic/synthetic-customer-segmentation/pii-field-inclusion-policy-edge-cases]]"
---

# นโยบายการใส่ PII Field ใน Segment Export

segment membership ที่ export ออกไปยัง marketing channel ห้ามมี PII field โดยตรง เช่น ชื่อ, email, หรือ phone — ต้องส่งเฉพาะ `customer_token` ที่เป็น hashed identifier เท่านั้น แต่ละ channel รับผิดชอบ resolve token เป็น identity ในระบบของตัวเอง

segment definition ที่สร้างใน [[structure/synthetic-customer-segmentation/module-segment-builder]] ต้องตั้ง `excludePiiFields: true` เสมอ — field นี้ไม่ใช่ optional แต่เป็น required ที่ถูก default เป็น true และไม่สามารถ set เป็น false ผ่าน regular API ได้

## ทำไมไม่ส่ง PII ตรงไปยัง channel

การส่ง PII ตรงทำให้ SegmentIQ กลายเป็น processor ที่ต้อง sign DPA กับทุก marketing channel ที่เชื่อมต่อ ซึ่งซับซ้อนและมีความเสี่ยงทางกฎหมายสูง การส่งแค่ token ทำให้แต่ละ channel รับผิดชอบ PII ของตัวเองเพียงฝ่ายเดียว

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-customer-segmentation/pii-field-inclusion-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
