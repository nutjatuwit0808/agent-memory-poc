---
layer: deployment
tags: [edge-node, deployment, runbook]
created: 2026-03-02
links:
  - "[[structure/synthetic-content-delivery/module-geo-router]]"
  - "[[support-cases/synthetic-content-delivery/case-2324]]"
---

# Edge Node Deployment Runbook

ขั้นตอนการเพิ่ม PoP ใหม่หรือ update software บน edge node ที่มีอยู่แล้ว — ต้องทำตามลำดับที่กำหนดเพื่อป้องกัน traffic disruption

## การเพิ่ม PoP ใหม่

1) ลง software และ config บน node ใหม่ 2) อัปเดต topology config ใน [[structure/synthetic-content-delivery/module-geo-router]] ทันที ไม่รอ cache expire (บทเรียนจาก [[support-cases/synthetic-content-delivery/case-2324]]) 3) รัน health check probe ยืนยัน 4) เปิด traffic ค่อยๆ ผ่าน canary routing

## การถอด PoP ออก

1) Drain traffic ออกจาก node ก่อน ไม่ terminate ทันที 2) รอให้ connection ที่ค้างอยู่ปิดครบภายใน `DRAIN_TIMEOUT_SECONDS` 3) Remove จาก topology config 4) ยืนยันว่าไม่มี traffic เข้าอีกก่อน terminate
