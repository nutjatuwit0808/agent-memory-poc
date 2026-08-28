---
layer: deployment
tags: [incident, runbook]
created: 2026-05-10
links:
  - "[[business-logic/synthetic-e-learning/certificate-revocation-policy]]"
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = progress data loss, certificate issued incorrectly, assessment security breach, Sev2 = compliance notification failure, sync failure ที่กระทบ report, Sev3 = course catalog staleness, minor UX bug ที่ไม่กระทบ data

## กรณีออก Certificate ผิด

ถ้าพบว่า certificate ออกก่อนเวลาหรือออกโดยผิดพลาด ให้ revoke ทันทีโดยไม่รอยืนยัน เพราะ certificate ที่ไม่ valid มีความเสี่ยงทาง regulatory สูงกว่าความไม่สะดวกจาก revoke ดู [[business-logic/synthetic-e-learning/certificate-revocation-policy]] สำหรับกระบวนการ
