---
layer: structure
tags: [supply-chain, supplylink, gateway, api]
created: 2025-12-07
links:
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
  - "[[structure/synthetic-supply-chain/module-shipment-tracker]]"
---

# API Gateway

คำสั่งจาก ERP ภายนอกและซัพพลายเออร์ portal เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลง requisition ใน ERP เป็น purchase order แล้วส่งต่อให้ [[structure/synthetic-supply-chain/module-purchase-order-engine]] คำขอที่ต้องการผลทันที เช่น เช็คสถานะ PO ปัจจุบัน ใช้ synchronous call ตรงนี้

การแจ้งเตือนจากซัพพลายเออร์เรื่องสถานะการจัดส่ง (Advance Ship Notice) เข้าผ่าน webhook endpoint แยกต่างหากที่ [[structure/synthetic-supply-chain/module-shipment-tracker]] ดูแลเอง เพราะ volume สูงและต้องการ idempotency key ตรวจสอบ duplicate ก่อนประมวลผล
