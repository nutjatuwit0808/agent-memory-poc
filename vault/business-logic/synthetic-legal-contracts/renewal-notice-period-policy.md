---
layer: business-logic
tags: [renewal, policy]
created: 2026-01-11
links:
  - "[[business-logic/synthetic-legal-contracts/renewal-notice-period-policy-edge-cases]]"
---

# นโยบายระยะเวลาแจ้งเตือนต่ออายุสัญญา

สัญญาทุกฉบับที่มีวันหมดอายุต้องได้รับการแจ้งเตือนล่วงหน้า `RENEWAL_NOTICE_DAYS_DEFAULT` วันก่อนหมดอายุ เพื่อให้ทีมมีเวลาตัดสินใจว่าจะต่ออายุหรือยกเลิก

ถ้าไม่มีการตอบสนองต่อการแจ้งเตือนภายในเวลาที่กำหนด ระบบจะแจ้งเตือนซ้ำและยกระดับไปยังหัวหน้าทีมกฎหมายก่อนวันหมดอายุจริง ไม่ปล่อยให้สัญญาหมดอายุไปเงียบๆ โดยไม่มีใครรับทราบ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-legal-contracts/renewal-notice-period-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
