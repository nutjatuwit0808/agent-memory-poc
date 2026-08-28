---
layer: business-logic
tags: [scanning, policy]
created: 2026-06-26
links:
  - "[[business-logic/synthetic-event-ticketing/entry-scan-duplicate-prevention-policy-edge-cases]]"
---

# นโยบายป้องกันการสแกนบัตรซ้ำ

บัตรหนึ่งใบสแกนเข้างานได้ครั้งเดียวเท่านั้น การสแกนครั้งที่สองสำหรับบัตรเดียวกันจะถูกปฏิเสธทันทีไม่ว่าจะสแกนที่ประตูเดียวกันหรือคนละประตู

ระบบต้องตรวจสอบ duplicate entry แบบ real-time ข้ามทุกประตูของสถานที่จัดงาน ไม่ใช่ตรวจสอบแค่ภายในประตูเดียวกัน เพื่อป้องกันบัตรใบเดียวถูกใช้เข้างานพร้อมกันที่คนละประตู

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-event-ticketing/entry-scan-duplicate-prevention-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
