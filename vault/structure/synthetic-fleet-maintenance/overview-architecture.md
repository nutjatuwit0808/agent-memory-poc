---
layer: structure
tags: [fleet-maintenance, wrenchhub, architecture, overview]
created: 2026-02-19
links:
  - "[[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]]"
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
  - "[[structure/synthetic-fleet-maintenance/module-parts-inventory]]"
  - "[[structure/synthetic-fleet-maintenance/module-inspection-recorder]]"
  - "[[structure/synthetic-fleet-maintenance/module-downtime-tracker]]"
  - "[[structure/synthetic-fleet-maintenance/module-reorder-trigger]]"
---

# ภาพรวมสถาปัตยกรรม WrenchHub — ระบบบำรุงรักษาฝูงรถขนส่ง

WrenchHub คือแพลตฟอร์มบริหารการบำรุงรักษายานพาหนะของบริษัทโลจิสติกส์ กำหนดตารางบำรุงรักษาเชิงป้องกันตามระยะทางและเวลา สร้างและจัดการ work order สำหรับการซ่อม ติดตามสต็อกอะไหล่พร้อม reorder point จดบันทึกผลการตรวจสภาพรถ และติดตาม downtime ของยานพาหนะแต่ละคัน

ระบบแบ่งออกเป็น service ย่อยตามหน้าที่หลัก ตั้งแต่วางแผนการบำรุงรักษา จัดการ work order ดูแลคลังอะไหล่ บันทึกผลตรวจ ติดตามเวลารถหยุดทำงาน และสั่งซื้ออะไหล่เมื่อสต็อกต่ำ ทีมช่างเรียกช่วง 07:00-09:00 ว่า morning dispatch window เพราะเป็นช่วงที่รถออกจากอู่และทีมต้องยืนยันสภาพก่อนปล่อยรถ

## Module หลัก

- **maintenance-scheduler** — คำนวณว่า vehicle คันไหนถึงกำหนดบำรุงรักษาเมื่อไหร่ โดยใช้ทั้ง odometer-based tri ดู [[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]]
- **work-order-manager** — สร้างและจัดการ work order สำหรับทั้งการซ่อมฉุกเฉินและการบำรุงรักษาตามแผน บันทึก ดู [[structure/synthetic-fleet-maintenance/module-work-order-manager]]
- **parts-inventory** — ติดตามปริมาณอะไหล่คงเหลือในคลัง บันทึก reorder point ต่อ part และ publish event ดู [[structure/synthetic-fleet-maintenance/module-parts-inventory]]
- **inspection-recorder** — บันทึกผลการตรวจสภาพยานพาหนะก่อนออกและหลังกลับอู่ ตรวจสอบว่า checklist ที่ใช้ตรงก ดู [[structure/synthetic-fleet-maintenance/module-inspection-recorder]]
- **downtime-tracker** — นับเวลาที่รถไม่สามารถใช้งานได้ตาม SLA ที่ตกลงไว้กับลูกค้า ติดตาม downtime event ดู [[structure/synthetic-fleet-maintenance/module-downtime-tracker]]
- **reorder-trigger** — รับ event เมื่อสต็อกอะไหล่ต่ำกว่า reorder point แล้วสร้าง purchase request ไปยัง ดู [[structure/synthetic-fleet-maintenance/module-reorder-trigger]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-fleet-maintenance/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-fleet-maintenance/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-fleet-maintenance/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-fleet-maintenance/database-schema]]
