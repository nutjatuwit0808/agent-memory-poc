---
layer: business-logic
tags: [feature-store, policy]
created: 2026-08-11
links:
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
  - "[[business-logic/synthetic-inventory-forecasting/feature-freshness-policy-edge-cases]]"
---

# นโยบายความสดของ Feature

feature ใดๆ ที่อายุเกิน `MAX_FEATURE_LAG_HOURS` (30 ชั่วโมง) นับเป็น stale — [[structure/synthetic-inventory-forecasting/module-demand-model-runner]] จะปฏิเสธไม่รันพยากรณ์สำหรับ SKU x store ที่ feature stale แทนที่จะรันด้วยข้อมูลเก่าเงียบๆ

SKU x store ที่ถูกข้ามเพราะ feature stale จะถูกจัดเป็นผลลัพธ์ `partial` ของ batch นั้น และ retry อัตโนมัติในรอบถัดไปเมื่อ feature สดขึ้น

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-inventory-forecasting/feature-freshness-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
