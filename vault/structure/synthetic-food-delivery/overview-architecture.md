---
layer: structure
tags: [food-delivery, quickbite, architecture, overview]
created: 2026-02-25
links:
  - "[[structure/synthetic-food-delivery/module-order-router]]"
  - "[[structure/synthetic-food-delivery/module-driver-dispatch]]"
  - "[[structure/synthetic-food-delivery/module-eta-estimator]]"
  - "[[structure/synthetic-food-delivery/module-surge-pricer]]"
  - "[[structure/synthetic-food-delivery/module-restaurant-relay]]"
  - "[[structure/synthetic-food-delivery/module-driver-payout-engine]]"
---

# ภาพรวมสถาปัตยกรรม QuickBite — ระบบสั่งอาหารออนไลน์

QuickBite คือแพลตฟอร์มสั่งอาหารออนไลน์ที่เชื่อมต่อร้านอาหารกับลูกค้าผ่านคนขับที่พาร์ทเนอร์กับระบบ ทำงานแบบ real-time ตั้งแต่รับออร์เดอร์ จัดส่งงานให้คนขับที่ใกล้ที่สุด ไปจนถึงคำนวณเวลาจัดส่งโดยประมาณ (ETA) โดยใช้ข้อมูลการจราจรจริงและเวลาเตรียมอาหารของร้าน

ระบบแบ่งเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่การ routing ออร์เดอร์ การ dispatch คนขับ การประมาณ ETA การคำนวณราคา surge ในช่วงเวลาเร่งด่วน และการคำนวณรายได้ของคนขับ ทีมวิศวกรรมเรียกช่วง 11:30-13:30 ว่า lunch peak เพราะเป็นช่วงที่ออร์เดอร์ไหลเข้าหนาแน่นที่สุดในแต่ละวัน

## Module หลัก

- **order-router** — รับออร์เดอร์ใหม่จาก API gateway แล้วตัดสินใจว่าจะส่งให้ร้านไหนและคนขับคนไหน — เป็น service เดียวที่เห็นภาพรวมทั้ง supply (คนขับว่าง) และ demand (ออร์เดอร์รอ) พร้อมกัน แยกออกมาจาก driver-dispatch เพราะ logic การ match ออร์เดอร์กับคนขับซับซ้อนขึ้นเรื่อยๆ ดู [[structure/synthetic-food-delivery/module-order-router]]
- **driver-dispatch** — เจ้าของสถานะคนขับทุกคนในระบบ (ตำแหน่ง, สถานะ online/offline, ออร์เดอร์ที่ถืออยู่ ดู [[structure/synthetic-food-delivery/module-driver-dispatch]]
- **eta-estimator** — คำนวณ ETA ของออร์เดอร์แบบ real-time โดยรวมเวลา 3 ส่วน: เวลาเดินทางของคนขับไปถึงร ดู [[structure/synthetic-food-delivery/module-eta-estimator]]
- **surge-pricer** — คำนวณ surge multiplier สำหรับออร์เดอร์ในพื้นที่และช่วงเวลาที่ demand สูงกว่า sup ดู [[structure/synthetic-food-delivery/module-surge-pricer]]
- **restaurant-relay** — เชื่อมต่อระหว่าง QuickBite กับแต่ละร้านอาหาร รับผิดชอบส่งออร์เดอร์ไปให้ร้านยืนยั ดู [[structure/synthetic-food-delivery/module-restaurant-relay]]
- **driver-payout-engine** — คำนวณรายได้ของคนขับต่อออร์เดอร์ รวมถึง base fee, distance bonus, tip ที่ลูกค้าให ดู [[structure/synthetic-food-delivery/module-driver-payout-engine]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-food-delivery/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-food-delivery/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-food-delivery/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-food-delivery/database-schema]]
