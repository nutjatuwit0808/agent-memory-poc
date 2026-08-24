---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-07-29
links:
  - "[[support-cases/synthetic-hr-onboarding/case-8048]]"
---

# Scaling Policy

## Autoscaling

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| onboarding-workflow-engine | 2 | 6 | CPU > 70% |
| task-assignment | 1 | 4 | queue depth > 300 |
| access-provisioning | 2 | 6 | queue depth > 150 (เข้มกว่าที่อื่นเพราะกระทบ day-one deadline) |

## ข้อจำกัดช่วง cohort ใหญ่

การ scale software service ช่วยได้แค่ระดับ queue processing ไม่ได้แก้ปัญหา inventory อุปกรณ์จริงที่จำกัด (ดู [[support-cases/synthetic-hr-onboarding/case-8048]]) ต้องวางแผน inventory ล่วงหน้าแยกต่างหาก
