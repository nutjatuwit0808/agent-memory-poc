---
layer: structure
tags: [shipment, tracking, module]
created: 2025-09-19
links:
  - "[[business-logic/synthetic-supply-chain/lead-time-sla-policy]]"
  - "[[convention/synthetic-supply-chain/supplier-id-convention]]"
---

# Module: shipment-tracker

ติดตามสถานะการจัดส่งสินค้าจากซัพพลายเออร์ตั้งแต่ออกจากโรงงานซัพพลายเออร์จนถึงคลังสินค้าของลูกค้า รับ Advance Ship Notice (ASN) จากซัพพลายเออร์ผ่าน webhook และ update milestone event ตามข้อมูลของ carrier ระบบ alert ทีม procurement เมื่อการจัดส่งมีความเสี่ยงจะผิด SLA ที่ตกลงกันไว้

## ฟังก์ชันหลัก
- `processASN(supplierId: string, asn: AdvanceShipNotice): Promise<Shipment>` — รับและประมวลผล ASN จากซัพพลายเออร์ สร้าง shipment record พร้อม expected arrival
- `updateShipmentMilestone(shipmentId: string, milestone: ShipmentEvent): Promise<void>` — อัปเดต event เช่น departed, in_customs, arrived_port พร้อม timestamp จริง
- `checkSLACompliance(shipmentId: string): Promise<SLAStatus>` — ตรวจสอบว่า shipment นี้จะถึงทันเวลาตาม [[business-logic/synthetic-supply-chain/lead-time-sla-policy]] หรือไม่
- `flagDelayedShipment(shipmentId: string, estimatedDelay: number): Promise<void>` — ตั้ง flag delay และแจ้ง procurement team เมื่อ ETA เลื่อนเกินเกณฑ์

## ความสัมพันธ์กับ module อื่น

เป็น service เดียวที่รับ webhook จากซัพพลายเออร์โดยตรง ต้องทำ idempotency check ทุก request เพราะซัพพลายเออร์มักส่ง ASN ซ้ำ milestone ที่ track ได้ครอบคลุมทั้ง land, sea, air freight ตาม event schema ที่กำหนดไว้ใน [[convention/synthetic-supply-chain/supplier-id-convention]]
