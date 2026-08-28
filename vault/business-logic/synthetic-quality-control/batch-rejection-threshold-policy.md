---
layer: business-logic
tags: [batch, rejection, policy]
created: 2025-11-06
links:
  - "[[structure/synthetic-quality-control/module-spc-analyzer]]"
  - "[[business-logic/synthetic-quality-control/batch-rejection-threshold-policy-edge-cases]]"
---

# นโยบายเกณฑ์การ Reject Batch

batch จะถูก reject และส่ง rework เมื่อ [[structure/synthetic-quality-control/module-spc-analyzer]] ตรวจพบ violation ระดับ `action` อย่างน้อย 1 จุด หรือ violation ระดับ `warning` เกิน 3 จุดติดต่อกัน ทั้งสองกรณีถือว่า process ไม่อยู่ใน statistical control

batch จะถูก quarantine ทันที (ข้าม rework) เมื่อจำนวน violation เกิน threshold พิเศษที่กำหนดไว้ต่อ product line หรือเมื่อ batch เดิมเข้า rework มาแล้วเกิน `BATCH_MAX_REWORK_CYCLES` รอบ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-quality-control/batch-rejection-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
