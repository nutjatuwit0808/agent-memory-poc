---
layer: business-logic
tags: [disposal, lifecycle, policy]
created: 2026-02-13
links:
  - "[[structure/synthetic-asset-management/module-disposal-workflow]]"
  - "[[business-logic/synthetic-asset-management/asset-minimum-useful-life-policy-edge-cases]]"
---

# นโยบายอายุการใช้งานขั้นต่ำก่อน Dispose

สินทรัพย์ IT ที่มีอายุการใช้งานน้อยกว่าเกณฑ์ขั้นต่ำที่กำหนดไว้ตาม category จะไม่สามารถเริ่มกระบวนการ disposal ได้ผ่าน [[structure/synthetic-asset-management/module-disposal-workflow]] โดยอัตโนมัติ — ฮาร์ดแวร์ทั่วไปขั้นต่ำ 2 ปี, อุปกรณ์เครือข่ายขั้นต่ำ 4 ปี

นโยบายนี้มีขึ้นเพื่อป้องกันการ dispose สินทรัพย์ที่ยังใช้ได้ดีก่อนเวลา ซึ่งทำให้ค่าเสื่อมราคาในบัญชีไม่สะท้อนความจริงและเพิ่มต้นทุนการจัดซื้อโดยไม่จำเป็น

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-asset-management/asset-minimum-useful-life-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
