---
layer: business-logic
tags: [scheduling, policy]
created: 2025-10-01
links:
  - "[[business-logic/synthetic-energy-management/equipment-minimum-off-time-policy-edge-cases]]"
---

# นโยบายระยะเวลาปิดขั้นต่ำของอุปกรณ์

อุปกรณ์ที่ถูกสั่งปิดต้องปิดค้างไว้อย่างน้อย 10 นาทีก่อนเปิดใหม่ได้ ไม่ว่าคำสั่งเปิดจะมาจากแหล่งไหนก็ตาม เพื่อป้องกันความเสียหายทางกลไกจากการเปิด-ปิดถี่เกินไป (short cycling)

กฎนี้ใช้กับอุปกรณ์ที่มีมอเตอร์หรือคอมเพรสเซอร์เป็นหลัก อุปกรณ์ประเภทไฟฟ้าแสงสว่างไม่มีข้อจำกัดนี้เพราะไม่มีความเสี่ยงทางกลไกแบบเดียวกัน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-energy-management/equipment-minimum-off-time-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
