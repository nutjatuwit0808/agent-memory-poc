---
layer: business-logic
tags: [depreciation, finance, policy]
created: 2026-08-17
links:
  - "[[structure/synthetic-asset-management/module-depreciation-engine]]"
  - "[[business-logic/synthetic-asset-management/depreciation-method-policy-edge-cases]]"
---

# นโยบายการเลือก Depreciation Method สำหรับสินทรัพย์

สินทรัพย์แต่ละประเภทใช้ depreciation method ที่กำหนดตายตัวตาม category ไม่ใช่ตาม case ต่อ case — ฮาร์ดแวร์คอมพิวเตอร์ (แล็ปท็อป, เซิร์ฟเวอร์) ใช้ Straight-line ตลอด 3 ปี ส่วนอุปกรณ์เครือข่ายและ infrastructure ใช้ Straight-line ตลอด 5 ปี

การใช้ Double-declining balance สำหรับสินทรัพย์ใดๆ ต้องมีการอนุมัติจาก CFO เป็นรายกรณี — [[structure/synthetic-asset-management/module-depreciation-engine]] ไม่อนุญาตให้ set method เป็น `double-declining` ผ่าน API ทั่วไป ต้องใช้ privileged endpoint แยก

## เหตุผลที่ใช้ Straight-line เป็น default

Straight-line ทำให้ค่าใช้จ่ายกระจายเท่ากันทุกปี ซึ่งสะดวกสำหรับการวางแผนงบประมาณ IT ที่ต้องการ predictability — Double-declining ให้ภาษีได้เปรียบในปีแรกๆ แต่สร้างความซับซ้อนในการ compare ต้นทุน asset ชนิดเดียวกันที่ซื้อต่างปีกัน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-asset-management/depreciation-method-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
