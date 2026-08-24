---
layer: deployment
tags: [ranking, runbook]
created: 2025-09-18
links:
  - "[[convention/synthetic-social-feed/testing-convention]]"
  - "[[support-cases/synthetic-social-feed/case-4859]]"
---

# Ranking Model Rollout Runbook

ขั้นตอนละเอียดสำหรับ deploy โมเดลจัดอันดับหรือ moderation เวอร์ชันใหม่ ตามที่กำหนดไว้ใน [[convention/synthetic-social-feed/testing-convention]]

## ก่อน rollout

ต้องผ่าน canary test กับ traffic 1% อย่างน้อย 24 ชั่วโมง และยืนยันว่า cache key รวม model version ไว้ด้วยแล้ว — บทเรียนจาก [[support-cases/synthetic-social-feed/case-4859]]

## ระหว่างเฝ้าระวัง

เฝ้าดู false-positive rate ของ moderation และ engagement rate ของ ranking เทียบกับ baseline ถ้าต่างกันเกิน 10% ให้หยุดขยาย rollout ทันที
