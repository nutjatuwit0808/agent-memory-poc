---
layer: structure
tags: [supply-chain, supplylink, queue, async]
created: 2026-04-13
links:
  - "[[structure/synthetic-supply-chain/module-goods-receipt-processor]]"
  - "[[structure/synthetic-supply-chain/module-replenishment-trigger]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `po.confirmed`, `po.shipped`, `shipment.arrived`, `inspection.passed`, `inspection.rejected`, `replenishment.triggered` — [[structure/synthetic-supply-chain/module-goods-receipt-processor]] เป็นทั้งผู้ subscribe หลายช่องทางและ publish ผลลัพธ์ต่อ

[[structure/synthetic-supply-chain/module-replenishment-trigger]] subscribe `inspection.passed` เพื่อนับปริมาณสินค้าที่ผ่านการตรวจสอบและเข้าสต็อกจริง แล้วเปรียบเทียบกับ threshold เพื่อตัดสินใจสร้าง PO ใหม่อัตโนมัติ การออกแบบแบบ event-driven ทำให้ replenishment ไม่ต้องพึ่ง polling สต็อกทุกนาที
