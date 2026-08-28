---
layer: structure
tags: [supply-chain, supplylink, architecture, overview]
created: 2025-12-22
links:
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
  - "[[structure/synthetic-supply-chain/module-supplier-catalog]]"
  - "[[structure/synthetic-supply-chain/module-goods-receipt-processor]]"
  - "[[structure/synthetic-supply-chain/module-quality-inspection-gate]]"
  - "[[structure/synthetic-supply-chain/module-replenishment-trigger]]"
  - "[[structure/synthetic-supply-chain/module-shipment-tracker]]"
---

# ภาพรวมสถาปัตยกรรม SupplyLink — ระบบจัดการห่วงโซ่อุปทาน

SupplyLink คือแพลตฟอร์มจัดการห่วงโซ่อุปทานสำหรับบริษัทผู้ผลิต ครอบคลุมตั้งแต่การสร้าง purchase order ติดตามการจัดส่งจากซัพพลายเออร์ไปจนถึงการรับสินค้าเข้าคลัง ระบบเชื่อมต่อกับ ERP ของลูกค้าแต่ละรายโดยรับผิดชอบเฉพาะ "ชั้นของการจัดการซัพพลายเออร์และสินค้าขาเข้า" ส่วน ERP ยังคงเป็นเจ้าของข้อมูลการผลิตและ BOM ระดับธุรกิจ

ระบบแบ่งเป็น service ย่อยตามหน้าที่ได้แก่ การออก PO การติดตามซัพพลายเออร์ การตรวจสอบคุณภาพสินค้าขาเข้า และการเติมสต็อกอัตโนมัติ ทีมวิศวกรรมเรียกกระบวนการ "PO → จัดส่ง → รับสินค้า → ตรวจสอบ → เข้าสต็อก" ว่า procurement loop ซึ่งใช้เวลาตั้งแต่ไม่กี่วันถึงหลายสัปดาห์ขึ้นอยู่กับประเภทสินค้าและระยะทาง

## Module หลัก

- **purchase-order-engine** — รับผิดชอบ lifecycle ของ Purchase Order ทั้งหมดตั้งแต่สร้างจนถึงปิด PO ครอบคลุมกา ดู [[structure/synthetic-supply-chain/module-purchase-order-engine]]
- **supplier-catalog** — เก็บข้อมูลซัพพลายเออร์ทั้งหมด ครอบคลุมรายการสินค้าที่ซัพพลายเออร์แต่ละรายจัดหาได ดู [[structure/synthetic-supply-chain/module-supplier-catalog]]
- **goods-receipt-processor** — จัดการกระบวนการรับสินค้าจากซัพพลายเออร์ทั้งหมด ตั้งแต่บันทึกการมาถึง ส่งต่อให้ตร ดู [[structure/synthetic-supply-chain/module-goods-receipt-processor]]
- **quality-inspection-gate** — ดำเนินการตรวจสอบคุณภาพสินค้าขาเข้าตาม specification ที่กำหนดต่อ SKU ระบบรองรับทั ดู [[structure/synthetic-supply-chain/module-quality-inspection-gate]]
- **replenishment-trigger** — ตรวจสอบระดับสต็อกเทียบกับ reorder point ที่กำหนดต่อ SKU และสร้าง purchase order ดู [[structure/synthetic-supply-chain/module-replenishment-trigger]]
- **shipment-tracker** — ติดตามสถานะการจัดส่งสินค้าจากซัพพลายเออร์ตั้งแต่ออกจากโรงงานซัพพลายเออร์จนถึงคลั ดู [[structure/synthetic-supply-chain/module-shipment-tracker]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-supply-chain/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-supply-chain/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-supply-chain/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-supply-chain/database-schema]]
