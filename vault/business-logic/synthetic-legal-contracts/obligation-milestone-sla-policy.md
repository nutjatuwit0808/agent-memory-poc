---
layer: business-logic
tags: [obligation, policy]
created: 2026-04-08
links:
  - "[[business-logic/synthetic-legal-contracts/obligation-milestone-sla-policy-edge-cases]]"
---

# นโยบาย SLA การติดตามพันธะสัญญา

พันธะสัญญาทุกรายการที่มีกำหนดเวลา (milestone) ต้องมีการตรวจสอบสถานะอย่างน้อยทุก 7 วันก่อนถึงกำหนด และแจ้งเตือนเจ้าของงานล่วงหน้าตามระยะเวลาที่กำหนดในสัญญาแต่ละประเภท

พันธะที่เลยกำหนดแล้วยังไม่เสร็จ (`getOverdueObligations`) ต้องถูกรายงานในรายงานความเสี่ยงประจำสัปดาห์ของทีมกฎหมายเสมอ ไม่ว่ามูลค่าหรือความสำคัญของสัญญาจะต่ำแค่ไหนก็ตาม

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-legal-contracts/obligation-milestone-sla-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
