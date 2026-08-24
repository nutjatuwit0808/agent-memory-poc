---
layer: deployment
tags: [incident, runbook]
created: 2026-07-23
links:
  - "[[structure/synthetic-marketing-automation/module-consent-manager]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = ส่งผิดกลุ่มหรือละเมิด consent, Sev2 = deliverability ตกกระทบหลาย campaign, Sev3 = กระทบ campaign เดียวไม่ถึงลูกค้าปลายทางเป็นวงกว้าง

## กรณีละเมิด consent

ทุกเหตุการณ์ที่เกี่ยวกับ [[structure/synthetic-marketing-automation/module-consent-manager]] ต้องยกระดับเป็น Sev1 เสมอไม่ว่าจำนวนผู้ได้รับผลกระทบจะน้อยแค่ไหน และแจ้งทีม legal ภายใน 2 ชั่วโมงหลังยืนยันเหตุการณ์
