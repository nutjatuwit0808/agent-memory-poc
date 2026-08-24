---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-02-20
links:
  - "[[business-logic/synthetic-hr-onboarding/day-one-access-policy]]"
---

# Provisioning Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure (การเชื่อมต่อ IT ticketing system, badge system) เท่านั้น ไม่ใช่ business timeout ของ day-one access — ดูเรื่องนั้นที่ [[business-logic/synthetic-hr-onboarding/day-one-access-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| Badge system API call | 8s | env `BADGE_SYSTEM_TIMEOUT_MS` |
| IT ticketing API call | 15s | env `IT_TICKETING_TIMEOUT_MS` |
| Provisioning queue visibility timeout | 30s | queue config |
| API gateway → onboarding-workflow-engine | 10s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |

## เหตุการณ์ที่เจอจริง

เดือนเมษายน 2026 พบว่า badge system timeout สั้นเกินไปช่วงที่ vendor นั้นมี latency สูงผิดปกติ ทำให้ request ถูกตัดก่อนที่ badge system จะตอบสำเร็จจริง ต้อง retry ซ้ำโดยไม่จำเป็น ขยับ timeout จาก 5s เป็น 8s แก้ปัญหาได้
