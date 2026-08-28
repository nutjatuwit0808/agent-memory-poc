---
layer: convention
tags: [review, quality]
created: 2026-04-21
links:
  - "[[support-cases/synthetic-e-learning/case-8009]]"
  - "[[support-cases/synthetic-e-learning/case-6904]]"
  - "[[support-cases/synthetic-e-learning/case-6656]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้ enrollment หรือ certificate status ต้องมี test ครอบคลุมกรณี concurrent request เสมอ (บทเรียนจาก [[support-cases/synthetic-e-learning/case-8009]]) และ API response ที่ return assessment data ต้องตรวจว่าไม่มี sensitive field ปนออกมา

## Security checkpoint

ทุก endpoint ที่เกี่ยวกับ assessment ต้องผ่าน security checklist ว่า (1) ไม่ส่ง correct answer ออกมา (2) มี server-side time validation (3) มี rate limit ป้องกัน brute force บทเรียนจาก [[support-cases/synthetic-e-learning/case-6904]] และ [[support-cases/synthetic-e-learning/case-6656]]
