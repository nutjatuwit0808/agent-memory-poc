---
layer: deployment
tags: [edge, runbook]
created: 2025-10-05
links:
  - "[[structure/synthetic-ad-bidding/module-bid-request-handler]]"
  - "[[structure/synthetic-ad-bidding/module-budget-pacer]]"
  - "[[deployment/synthetic-ad-bidding/rollback-procedure]]"
---

# Edge PoP Deployment Runbook

AdPulse deploy [[structure/synthetic-ad-bidding/module-bid-request-handler]] เป็น edge point-of-presence (PoP) กระจายหลายภูมิภาคเพื่อลด network latency ก่อนถึง SSP เอกสารนี้อธิบายขั้นตอนเพิ่ม/อัปเดต PoP ใหม่

## ก่อนเปิด PoP ใหม่

ต้องยืนยันว่า PoP ใหม่เชื่อมต่อกับ [[structure/synthetic-ad-bidding/module-budget-pacer]] กลางได้ภายใน latency ที่ยอมรับได้ (ไม่เกิน 10ms) ก่อนเปิดรับ traffic จริง ไม่งั้นจะกระทบความแม่นยำของการเช็ค budget สด

## การทดสอบก่อนเปิดรับ traffic เต็ม

เปิดรับ traffic แบบ canary 5% ก่อนเสมอ เฝ้าดู latency และ error rate เทียบกับ PoP อื่นอย่างน้อย 2 ชั่วโมงก่อนขยายเป็น 100% ดู [[deployment/synthetic-ad-bidding/rollback-procedure]] หากพบปัญหาระหว่างทดสอบ
