---
layer: business-logic
tags: [geo, restriction, policy]
created: 2025-11-13
links:
  - "[[structure/synthetic-content-delivery/module-geo-router]]"
  - "[[business-logic/synthetic-content-delivery/geo-restriction-policy-edge-cases]]"
---

# นโยบายการบังคับ Geo-Restriction

Tenant ที่มีสัญญา licensing แบบจำกัดประเทศสามารถตั้ง geo-restriction rule ผ่าน [[structure/synthetic-content-delivery/module-geo-router]] เพื่อบล็อก request จากประเทศที่ไม่ได้รับอนุญาต — rule จะถูก enforce ก่อน cache lookup ทุกครั้ง เพราะถ้า enforce หลัง cache lookup อาจเกิดกรณีที่ edge node ต่าง region ทำการดึง content และ cache ไว้ในจุดที่ไม่ควรมี

การตรวจสอบประเทศใช้ IP geolocation database ที่อัปเดตรายสัปดาห์ — accuracy ประมาณ 95-98% ซึ่ง tenant ต้องยอมรับว่าไม่สมบูรณ์ 100% ถ้าต้องการ accuracy สูงกว่านั้นต้องผสมกับ VPN detection ซึ่งเป็น add-on ราคาสูงกว่า

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-content-delivery/geo-restriction-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
