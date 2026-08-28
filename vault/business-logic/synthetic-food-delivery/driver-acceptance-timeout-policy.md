---
layer: business-logic
tags: [dispatch, timeout, policy]
created: 2026-08-07
links:
  - "[[structure/synthetic-food-delivery/module-order-router]]"
  - "[[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy-edge-cases]]"
---

# นโยบาย Timeout การยืนยันรับออร์เดอร์ของคนขับ

เมื่อ [[structure/synthetic-food-delivery/module-order-router]] ส่งออร์เดอร์ให้คนขับ คนขับมีเวลา `ORDER_ROUTER_PENDING_TIMEOUT_SEC` วินาทีในการยืนยันรับ ถ้าหมดเวลาหรือคนขับกดปฏิเสธ ออร์เดอร์จะถูก requeue ไปหาคนขับคนถัดไปโดยอัตโนมัติ

ออร์เดอร์ที่ถูก requeue เกิน `MAX_REQUEUE_ATTEMPTS` ครั้งจะถูกยกเลิกอัตโนมัติและแจ้งลูกค้า ไม่รอต่อไปอีก เพราะถ้าหาคนขับไม่ได้ใน 3 รอบ มักแปลว่า supply ในพื้นที่นั้นไม่พอ ไม่ใช่โชคไม่ดีชั่วคราว

## ทำไม timeout ถึงสั้น (90 วินาที)

การรอนานเกินไปทำให้ ETA ที่แสดงให้ลูกค้าเห็นตอนสั่งไม่ตรงกับความเป็นจริง ลูกค้าจะเสียความเชื่อมั่นมากกว่าถ้ารอนาน 5 นาทีแล้วถูกบอกว่าหาคนขับไม่ได้ เมื่อเทียบกับถูก cancel เร็วๆ แล้วมีโอกาสสั่งร้านอื่น

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
