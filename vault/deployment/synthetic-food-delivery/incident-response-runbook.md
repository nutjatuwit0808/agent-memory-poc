---
layer: deployment
tags: [incident, runbook]
created: 2026-05-21
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = ระบบรับออร์เดอร์ไม่ได้ทั้งหมดหรือ payout ผิดพลาดมาก, Sev2 = กระทบบางโซน/บาง service บางส่วน, Sev3 = กระทบเล็กน้อย user experience แย่ลงแต่ workflow หลักยังทำงานได้

## กรณีที่ต้อง escalate ทันที

payout double calculation หรือ driver assignment ที่ทำให้ driver ได้รับเงินผิด ต้องยกระดับเป็น Sev1 เสมอและแจ้ง Finance team ทันทีโดยไม่ต้องรอยืนยันจากทีม engineering
