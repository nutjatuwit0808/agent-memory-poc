---
layer: business-logic
tags: [restaurant, cancellation, policy]
created: 2026-07-03
links:
  - "[[structure/synthetic-food-delivery/module-restaurant-relay]]"
  - "[[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy-edge-cases]]"
---

# นโยบายค่าปรับเมื่อร้านยกเลิกออร์เดอร์

ร้านอาหารที่ยกเลิกออร์เดอร์หลังจากยืนยันรับแล้วจะถูกบันทึก cancellation event ผ่าน [[structure/synthetic-food-delivery/module-restaurant-relay]] ค่าปรับขึ้นอยู่กับว่ายกเลิกตอนไหน: ก่อนเริ่มเตรียม, ระหว่างเตรียม, หรือหลังคนขับมาถึงร้านแล้ว

ร้านที่มีอัตราการยกเลิกเกิน 5% ใน 7 วันย้อนหลัง จะถูกแขวน visibility ในหน้าค้นหาโดยอัตโนมัติ จนกว่า account manager จะ review และอนุมัติให้กลับมา

## อัตราค่าปรับตามช่วงเวลา

| ระยะเวลาที่ยกเลิก | ค่าปรับ (% ของมูลค่าออร์เดอร์) |
|---|---|
| ก่อน prepare เริ่ม | 0% |
| ระหว่าง prepare | 10% |
| หลังคนขับมาถึงร้าน | 25% |

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
