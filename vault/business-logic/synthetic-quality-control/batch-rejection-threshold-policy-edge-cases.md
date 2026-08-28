---
layer: business-logic
tags: [batch, rejection, edge-case]
created: 2026-03-06
links:
  - "[[business-logic/synthetic-quality-control/rework-approval-authority-policy]]"
  - "[[business-logic/synthetic-quality-control/batch-rejection-threshold-policy]]"
---

# กรณี Batch บางส่วนออกนอกสเปกเฉพาะช่วงเวลา

ถ้า violation กระจุกอยู่ในช่วงเวลาสั้นๆ ภายใน run (เช่น 10 นาทีแรกขณะ machine warm-up) และส่วนที่เหลือของ run อยู่ใน control ปกติ QC engineer สามารถขอ partial release เพื่อปล่อยเฉพาะ unit ที่ผลิตในช่วงที่ process stable แล้ว โดยต้องมี evidence ชัดเจนว่า violation จำกัดอยู่ในช่วงเวลานั้นจริง

partial release ต้องผ่านการอนุมัติจาก QC Manager (ไม่ใช่ QC Engineer ทั่วไป) และต้องบันทึก lot traceability แยกระหว่าง unit ที่ปล่อยกับ unit ที่ rework ให้ชัดเจน ดู [[business-logic/synthetic-quality-control/rework-approval-authority-policy]] สำหรับระดับอำนาจ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-quality-control/batch-rejection-threshold-policy]] ("นโยบายเกณฑ์การ Reject Batch") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
