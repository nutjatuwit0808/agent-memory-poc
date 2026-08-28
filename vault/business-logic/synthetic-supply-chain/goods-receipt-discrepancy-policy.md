---
layer: business-logic
tags: [receiving, discrepancy, policy]
created: 2026-08-15
links:
  - "[[structure/synthetic-supply-chain/module-goods-receipt-processor]]"
  - "[[business-logic/synthetic-supply-chain/lead-time-sla-policy]]"
---

# นโยบายจัดการ Discrepancy ตอนรับสินค้า

เมื่อสินค้าที่รับมามีจำนวนไม่ตรงกับ PO เกิน `PARTIAL_RECEIPT_TOLERANCE_PCT` เปอร์เซ็นต์ [[structure/synthetic-supply-chain/module-goods-receipt-processor]] จะ flag เป็น discrepancy และแจ้ง procurement team ทันที ไม่ปล่อยให้ปิด receipt โดยไม่มีการยืนยัน

ซัพพลายเออร์ต้องแจ้งเหตุสินค้าขาดพร้อม ETA ที่จะส่งเพิ่มภายใน 2 วันทำการ ถ้าไม่แจ้งภายใน deadline จะถูกบันทึกเป็น SLA breach ตาม [[business-logic/synthetic-supply-chain/lead-time-sla-policy]] โดยอัตโนมัติ
