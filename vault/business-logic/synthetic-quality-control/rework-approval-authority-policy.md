---
layer: business-logic
tags: [rework, authority, policy]
created: 2025-12-26
links:
  - "[[structure/synthetic-quality-control/module-batch-inspector]]"
  - "[[support-cases/synthetic-quality-control/case-3568]]"
  - "[[business-logic/synthetic-quality-control/rework-approval-authority-policy-edge-cases]]"
---

# นโยบายอำนาจการอนุมัติ Rework

การอนุมัติ rework แต่ละระดับต้องผ่านผู้มีอำนาจที่ต่างกัน QC Engineer อนุมัติ rework ทั่วไปที่ violation ไม่เกิน threshold พิเศษ QC Manager อนุมัติ rework ที่ violation เกิน threshold หรือ rework รอบที่ 2 Shift Director อนุมัติเฉพาะ quarantine release หรือ emergency shipment

[[structure/synthetic-quality-control/module-batch-inspector]] บล็อกไม่ให้ผู้ตรวจคนเดียวอนุมัติ rework ของ batch ที่ตัวเองตรวจรอบแรก เพื่อ prevent conflict of interest ดู `BATCH_DUAL_INSPECTOR_LOCK_SEC` สำหรับ window ที่บล็อก

## ทำไมบล็อก self-approval

เคยมีเหตุการณ์ที่ผู้ตรวจคนเดียวกันอนุมัติ rework ของ batch ที่ตัวเองพิจารณาว่า reject ทำให้ไม่มี independent check ดู [[support-cases/synthetic-quality-control/case-3568]] สำหรับรายละเอียด

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-quality-control/rework-approval-authority-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
