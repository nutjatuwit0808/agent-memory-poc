---
layer: deployment
tags: [scaling, infrastructure]
created: 2026-01-21
---

# Scaling Policy

## Autoscaling ของ service

| Service | Min replica | Max replica | Scale-up threshold |
|---|---|---|
| seat-inventory | 4 | 30 | latency p95 > 80ms |
| entry-scanner | 3 | 15 | queue depth > 100 |
| resale-marketplace | 2 | 6 | latency p95 > 200ms |

## ข้อจำกัดที่ต้องระวัง

seat-inventory ต้อง scale ล่วงหน้าก่อนเปิดขายบัตรงานยอดนิยมเสมอ ไม่รอ autoscale ตอบสนองตาม load แบบ reactive เพราะ traffic พุ่งขึ้นทันทีในวินาทีแรกที่เปิดขาย
