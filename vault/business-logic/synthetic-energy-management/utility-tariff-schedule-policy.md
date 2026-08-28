---
layer: business-logic
tags: [billing, policy]
created: 2026-06-08
links:
  - "[[structure/synthetic-energy-management/module-utility-bill-reconciler]]"
  - "[[business-logic/synthetic-energy-management/utility-tariff-schedule-policy-edge-cases]]"
---

# นโยบายตารางอัตราค่าไฟฟ้า

อัตราค่าไฟฟ้าที่ใช้คำนวณต้นทุนพลังงานต้องอัปเดตตามตารางที่การไฟฟ้าประกาศ (peak/off-peak, ฤดูกาล) — [[structure/synthetic-energy-management/module-utility-bill-reconciler]] ใช้อัตราปัจจุบันเสมอ ไม่ใช้อัตราเก่าค้างในระบบ

การเปลี่ยนอัตราค่าไฟฟ้าใหม่มีผลตั้งแต่วันที่การไฟฟ้าประกาศให้มีผลเท่านั้น ไม่ใช่วันที่ทีมอัปเดตข้อมูลในระบบ ถ้าอัปเดตช้าต้องคำนวณย้อนหลังให้ถูกต้องตามวันที่มีผลจริง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-energy-management/utility-tariff-schedule-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
