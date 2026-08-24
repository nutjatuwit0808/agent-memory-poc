---
layer: business-logic
tags: [cancellation, refund, policy]
created: 2026-06-02
links:
  - "[[business-logic/synthetic-travel-booking/cancellation-refund-proration-policy-edge-cases]]"
---

# นโยบายการคำนวณเงินคืนตามสัดส่วนเวลา (Proration)

จำนวนเงินคืนคำนวณจากสัดส่วนเวลาที่เหลือก่อนวันเข้าพัก เทียบกับ grace period ของ rate code นั้นๆ — ยกเลิกก่อน `CANCELLATION_FEE_GRACE_HOURS` (ปกติ 48 ชั่วโมง) คืนเต็มจำนวน ยกเลิกหลังจากนั้นหักค่าธรรมเนียมตามสัดส่วนชั่วโมงที่เหลือจริง ไม่ใช่หักแบบขั้นบันได

rate code ที่ขึ้นต้นด้วย `NON_REFUNDABLE_RATE_PREFIX` ไม่เข้าเงื่อนไข proration เลย — ไม่คืนเงินไม่ว่าจะยกเลิกเมื่อไหร่ ยกเว้นกรณีที่ระบุใน edge case ด้านล่าง

## ทำไมใช้สัดส่วนต่อเนื่องแทนขั้นบันได

การหักแบบขั้นบันได (เช่น ยกเลิกใน 24 ชม. สุดท้ายเสีย 100%) เคยสร้างความไม่พอใจตอนลูกค้ายกเลิกเร็วกว่า deadline ไม่กี่นาทีแต่โดนหักเต็ม — สัดส่วนต่อเนื่องยุติธรรมกว่าและอธิบายให้ลูกค้าเข้าใจง่ายกว่าด้วย

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-travel-booking/cancellation-refund-proration-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
