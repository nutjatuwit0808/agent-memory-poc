---
layer: business-logic
tags: [lead-time, sla, policy]
created: 2026-08-10
links:
  - "[[structure/synthetic-supply-chain/module-supplier-catalog]]"
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
  - "[[business-logic/synthetic-supply-chain/lead-time-sla-policy-edge-cases]]"
---

# นโยบาย SLA Lead Time การจัดส่งของซัพพลายเออร์

ซัพพลายเออร์แต่ละรายมี lead time ที่ตกลงกันไว้ใน contract ซึ่งบันทึกใน [[structure/synthetic-supply-chain/module-supplier-catalog]] เมื่อ [[structure/synthetic-supply-chain/module-purchase-order-engine]] สร้าง PO จะคำนวณ expected delivery date จาก lead time นี้ทันที

ถ้า actual delivery date ช้ากว่า expected เกิน 3 วันทำการสำหรับ critical material หรือเกิน 7 วันสำหรับ standard material ถือว่าซัพพลายเออร์ผิด SLA และต้องบันทึก penalty event ใน performance record ผ่าน [[structure/synthetic-supply-chain/module-supplier-catalog]]

## การคำนวณ Expected Delivery

Expected delivery = วันที่ confirm PO + lead time ที่ซัพพลายเออร์ยืนยันในการตอบ PO (ไม่ใช่ค่าเฉลี่ยจาก catalog) เพื่อให้ตัวเลขผูกกับ commitment จริงของซัพพลายเออร์แต่ละครั้ง ไม่ใช่ค่า default ที่อาจล้าสมัย

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-supply-chain/lead-time-sla-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
