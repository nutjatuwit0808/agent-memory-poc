---
layer: structure
tags: [supply-chain, supplylink, boundaries]
created: 2025-09-24
links:
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
  - "[[structure/synthetic-supply-chain/module-supplier-catalog]]"
  - "[[structure/synthetic-supply-chain/module-goods-receipt-processor]]"
  - "[[structure/synthetic-supply-chain/module-quality-inspection-gate]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-supply-chain/module-purchase-order-engine]] เป็นเจ้าของ PO lifecycle ทั้งหมด ส่วน [[structure/synthetic-supply-chain/module-supplier-catalog]] เป็นเจ้าของข้อมูลซัพพลายเออร์และราคา ทั้งสองไม่รู้จักข้อมูลของกันและกันโดยตรง

[[structure/synthetic-supply-chain/module-goods-receipt-processor]] เป็น service เดียวที่ query ข้าม [[structure/synthetic-supply-chain/module-purchase-order-engine]] และ [[structure/synthetic-supply-chain/module-quality-inspection-gate]] พร้อมกันได้ เพราะการรับสินค้าต้องตรวจสอบทั้ง PO ที่ออกไปและเกณฑ์คุณภาพในเวลาเดียวกัน การแยกออกจะทำให้เกิด race condition ระหว่างสอง service
