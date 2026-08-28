---
layer: business-logic
tags: [warranty, parts, policy]
created: 2026-03-03
links:
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
---

# นโยบายการเคลม Warranty อะไหล่

อะไหล่ที่เสียภายในระยะ warranty ที่ vendor รับประกัน สามารถขอเคลมคืนได้โดย [[structure/synthetic-fleet-maintenance/module-work-order-manager]] ต้องมี work order ID ที่บันทึกการติดตั้ง parts นั้นและ parts batch number ครบถ้วน

การเคลมต้องทำภายใน 14 วันหลังพบข้อบกพร่อง เกินนี้ warranty void โดยอัตโนมัติ ยกเว้นกรณีที่ vendor ยินยอมขยายเวลาเป็นรายกรณี
