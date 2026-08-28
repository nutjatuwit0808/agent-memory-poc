---
layer: deployment
tags: [monitoring, observability]
created: 2025-09-29
---

# Monitoring & Alerts

## Alert หลัก

certificate issue rate สูงผิดปกติ (อาจ signal bug), compliance notification delivery failure เกิน 5%, progress regression event เกิดขึ้น, assessment session ที่ค้างสถานะ `in_progress` เกิน timer * 2 โดยไม่ submit

## ช่องทางแจ้งเตือน

Sev1 แจ้งเข้า on-call ทันทีทาง pager compliance notification failure แจ้งทันทีเพราะกระทบ regulatory compliance ของลูกค้า background job failure ทุกอันต้อง alert ไม่ suppress
