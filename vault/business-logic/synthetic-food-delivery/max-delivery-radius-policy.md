---
layer: business-logic
tags: [routing, policy, delivery-radius]
created: 2026-01-09
links:
  - "[[structure/synthetic-food-delivery/module-order-router]]"
  - "[[business-logic/synthetic-food-delivery/max-delivery-radius-policy-edge-cases]]"
---

# นโยบายรัศมีสูงสุดในการจัดส่ง

ออร์เดอร์จะถูก route ไปยังคนขับที่อยู่ในรัศมีไม่เกิน `ORDER_ROUTER_MAX_RADIUS_KM` กิโลเมตรจากตำแหน่งร้านอาหารเท่านั้น ไม่ใช่จากตำแหน่งลูกค้า — เหตุผลคือเวลาที่ผันแปรมากที่สุดในออร์เดอร์คือเวลาคนขับเดินทางไปร้าน ไม่ใช่ช่วงส่งถึงลูกค้า

รัศมีนี้เป็นค่า hard limit ที่ [[structure/synthetic-food-delivery/module-order-router]] enforce ระหว่าง query คนขับว่าง ไม่ใช่ preference — คนขับที่อยู่เกินรัศมีจะไม่ถูกพิจารณาเลยแม้จะเป็นคนขับว่างคนเดียวในระบบก็ตาม

## ทำไมไม่ขยายรัศมีเมื่อหาคนขับไม่ได้

การขยายรัศมีแบบ dynamic อาจทำให้ ETA พุ่งสูงเกินสิ่งที่ลูกค้าคาดหวังตอนสั่ง — ทีมเลือกที่จะยกเลิกออร์เดอร์แล้วแจ้งลูกค้าให้รู้ตัว ดีกว่าส่งออร์เดอร์ช้าโดยไม่แจ้งล่วงหน้า

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-food-delivery/max-delivery-radius-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
