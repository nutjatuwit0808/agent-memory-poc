---
layer: deployment
tags: [incident, runbook]
created: 2026-01-28
---

# Incident Response Runbook

## ระดับความรุนแรง

Sev1 = compliance breach หรือ data loss risk (disposal ไม่มีใบรับรอง, overallocation ที่ vendor ตรวจพบ), Sev2 = ข้อมูลสินทรัพย์ไม่ถูกต้องแต่ยังไม่ส่งผลต่อ audit, Sev3 = UI/report เสียแต่ core data ยังถูก

## กรณี compliance breach

ทุกเหตุการณ์ที่กระทบ audit readiness ต้องแจ้ง compliance officer ภายใน 2 ชั่วโมง และเขียน incident report ภายใน 24 ชั่วโมง ไม่ว่า severity จะเป็นเท่าไหร่
