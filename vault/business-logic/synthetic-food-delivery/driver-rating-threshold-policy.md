---
layer: business-logic
tags: [driver, rating, policy]
created: 2026-05-30
links:
  - "[[structure/synthetic-food-delivery/module-driver-dispatch]]"
  - "[[business-logic/synthetic-food-delivery/driver-rating-threshold-policy-edge-cases]]"
---

# นโยบาย Rating Threshold สำหรับคนขับ

คนขับที่ rating เฉลี่ย 30 วันย้อนหลังต่ำกว่า 4.2 จะถูก flag โดย [[structure/synthetic-food-delivery/module-driver-dispatch]] และหยุดรับออร์เดอร์ใหม่อัตโนมัติ จนกว่าจะผ่าน review cycle ถัดไป (ทุก 2 สัปดาห์)

rating ที่คำนวณใช้ weighted average ที่ให้น้ำหนักมากกว่ากับ rating ล่าสุด เพื่อให้คนขับที่กำลังพัฒนาตัวเองได้รับโอกาสฟื้นตัวเร็วกว่าระบบ unweighted average ทั่วไป

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-food-delivery/driver-rating-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
