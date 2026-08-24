---
layer: business-logic
tags: [charging, policy]
created: 2026-04-12
links:
  - "[[business-logic/synthetic-warehouse-robotics/charging-priority-policy-edge-cases]]"
---

# นโยบายลำดับความสำคัญการชาร์จแบตเตอรี่

หุ่นยนต์ที่แบตเตอรี่ต่ำกว่า 15% ได้สิทธิ์เข้าคิวชาร์จก่อนหุ่นยนต์อื่นเสมอ ไม่ว่าคิวงานปัจจุบันจะเป็นอย่างไร — ป้องกันไม่ให้หุ่นยนต์แบตหมดกลางทางขณะถือสินค้าอยู่

ระบบกัน `CHARGING_RESERVE_SLOT_COUNT` หัวชาร์จไว้เฉพาะกรณีฉุกเฉินเสมอ ไม่ปล่อยให้หุ่นยนต์ backlog ทั่วไปจองเต็มทุกหัว

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-warehouse-robotics/charging-priority-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
