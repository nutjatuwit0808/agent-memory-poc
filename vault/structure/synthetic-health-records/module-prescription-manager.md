---
layer: structure
tags: [prescription, module, core]
created: 2025-11-02
links:
  - "[[business-logic/synthetic-health-records/prescription-refill-limit-policy]]"
  - "[[structure/synthetic-health-records/module-audit-log-service]]"
---

# Module: prescription-manager

จัดการการสั่งยาและติดตามการเบิกซ้ำ (refill) ตรวจสอบข้อจำกัดปริมาณและความถี่ตามที่กฎหมายกำหนดสำหรับยาแต่ละประเภท แยกออกมาจาก patient-record-store เพราะกฎการสั่งยามีความซับซ้อนเฉพาะทางที่เปลี่ยนแปลงบ่อยตามกฎหมายท้องถิ่น

## ฟังก์ชันหลัก
- `issuePrescription(patientId: string, drugCode: string, providerId: string): Promise<string>` — ออกใบสั่งยาใหม่ คืน prescriptionId
- `requestRefill(prescriptionId: string): Promise<RefillResult>` — ขอเบิกยาซ้ำ ตรวจสอบข้อจำกัดก่อนอนุมัติ
- `checkInteraction(patientId: string, newDrugCode: string): Promise<InteractionWarning[]>` — ตรวจสอบปฏิกิริยาระหว่างยากับยาที่ผู้ป่วยใช้อยู่

## State

issued → active → refill_requested → refill_approved | refill_denied — ดู [[business-logic/synthetic-health-records/prescription-refill-limit-policy]]

## ความสัมพันธ์กับ module อื่น

ทุกครั้งที่ออกใบสั่งยา publish event `prescription.issued` ให้ [[structure/synthetic-health-records/module-audit-log-service]] บันทึก ไม่เก็บ audit trail ของตัวเองแยกต่างหาก
