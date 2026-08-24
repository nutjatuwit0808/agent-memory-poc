---
layer: deployment
tags: [incident, runbook]
created: 2025-12-08
links:
  - "[[support-cases/synthetic-ad-bidding/case-5244]]"
  - "[[support-cases/synthetic-ad-bidding/case-6423]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = ระบบหยุดรับ bid request ทั้งหมดหรือมีการหักเงินผิดพลาด, Sev2 = กระทบบาง SSP/แคมเปญ, Sev3 = กระทบเล็กน้อยไม่ถึงผู้ลงโฆษณา

## กรณี billing ผิดพลาด

ทุกเหตุการณ์ที่เกี่ยวกับการหักเงินผิด (ดู [[support-cases/synthetic-ad-bidding/case-5244]] และ [[support-cases/synthetic-ad-bidding/case-6423]]) ต้องยกระดับเป็น Sev1 เสมอแม้จำนวนเงินจะน้อย และต้องแจ้งทีมการเงินภายใน 1 ชั่วโมง
