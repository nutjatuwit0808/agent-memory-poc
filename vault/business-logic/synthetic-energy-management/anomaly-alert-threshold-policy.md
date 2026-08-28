---
layer: business-logic
tags: [anomaly, policy]
created: 2026-04-07
links:
  - "[[business-logic/synthetic-energy-management/anomaly-alert-threshold-policy-edge-cases]]"
---

# นโยบายเกณฑ์การแจ้งเตือนความผิดปกติ

ค่าที่อ่านได้จาก meter จะถูกแจ้งเตือนว่าผิดปกติเมื่อเบี่ยงเบนจาก baseline เกิน `ANOMALY_STDDEV_MULTIPLIER` เท่าของค่าเบี่ยงเบนมาตรฐาน โดย baseline คำนวณจากข้อมูลย้อนหลัง `BASELINE_WINDOW_DAYS` วัน

ค่าที่เป็นไปไม่ได้ทางกายภาพ (เช่น ค่าติดลบสำหรับ meter ไฟฟ้า) จะถูกแจ้งเตือนทันทีโดยไม่ต้องรอเทียบกับ baseline เพราะเป็นสัญญาณของ meter เสียหรือส่งข้อมูลผิดพลาด ไม่ใช่ความผิดปกติเชิงพฤติกรรมการใช้งาน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-energy-management/anomaly-alert-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
