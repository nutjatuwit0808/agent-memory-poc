---
layer: deployment
tags: [incident, runbook]
created: 2025-12-23
links:
  - "[[support-cases/synthetic-inventory-forecasting/case-1481]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = พยากรณ์ผิดทั้งระบบหรือทำให้เกิดการสั่งซื้อผิดพลาดมูลค่าสูง, Sev2 = กระทบบาง category/ภูมิภาค, Sev3 = กระทบเล็กน้อยไม่ถึงการตัดสินใจสั่งซื้อจริง

## กรณีข้อมูล override หาย

เหตุการณ์ที่ override ของ analyst หายหรือถูกเขียนทับ (เช่น [[support-cases/synthetic-inventory-forecasting/case-1481]]) ต้องยกระดับเป็น Sev1 เสมอเพราะกระทบความน่าเชื่อถือของระบบต่อผู้ใช้งานโดยตรง
