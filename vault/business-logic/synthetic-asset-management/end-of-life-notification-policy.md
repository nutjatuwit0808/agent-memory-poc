---
layer: business-logic
tags: [lifecycle, eol, policy]
created: 2026-06-01
links:
  - "[[structure/synthetic-asset-management/module-depreciation-engine]]"
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
---

# นโยบายการแจ้ง End-of-Life ของสินทรัพย์

เมื่อ depreciation schedule ของสินทรัพย์ครบตามที่กำหนด (book value เหลือเป็นมูลค่าซากเท่านั้น) [[structure/synthetic-asset-management/module-depreciation-engine]] จะส่ง event ให้ทีม IT พิจารณาว่าสินทรัพย์ถึงเวลา dispose, refresh, หรือขยายอายุการใช้งาน

การขยายอายุการใช้งานเกินกว่า schedule เดิมต้องมีการประเมินสภาพจากทีมเทคนิคและบันทึกเหตุผลไว้ใน [[structure/synthetic-asset-management/module-asset-registry]] เพื่อ audit trail
