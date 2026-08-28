---
layer: deployment
tags: [backfill, data-recovery, runbook]
created: 2025-12-28
---

# Event Data Backfill Runbook

## เมื่อไหร่ต้อง backfill

เมื่อพบว่า event ชุดใดชุดหนึ่งสูญหายหรือถูก reject ผิดพลาดเนื่องจาก schema mismatch หรือ ingester downtime และต้องการ recompute membership ให้ถูกต้อง

## ขั้นตอน

1) ดึง event ที่หายจาก dead-letter queue หรือ source system backup 2) re-ingest ผ่าน `ingestEvent` API ปกติ (ไม่ bypass dedup เพราะ event อาจถูกส่งซ้ำบางส่วนแล้ว) 3) trigger manual refresh สำหรับ segment ที่ได้รับผลกระทบ 4) re-export ไปยัง channel
