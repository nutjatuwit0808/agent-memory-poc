---
layer: structure
tags: [prescription, module, core, reference, identifiers]
created: 2026-08-05
links:
  - "[[structure/synthetic-health-records/module-prescription-manager]]"
  - "[[business-logic/synthetic-health-records/prescription-refill-limit-policy]]"
---

# prescription-manager — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด prescription-manager สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-health-records/module-prescription-manager]])

## Public functions
- `issuePrescription(patientId: string, drugCode: string, providerId: string): Promise<string>` — ออกใบสั่งยาใหม่ คืน prescriptionId
- `requestRefill(prescriptionId: string): Promise<RefillResult>` — ขอเบิกยาซ้ำ ตรวจสอบข้อจำกัดก่อนอนุมัติ
- `checkInteraction(patientId: string, newDrugCode: string): Promise<InteractionWarning[]>` — ตรวจสอบปฏิกิริยาระหว่างยากับยาที่ผู้ป่วยใช้อยู่

## Internal constants
- `MAX_REFILL_COUNT_PER_PRESCRIPTION = 5`
- `REFILL_MIN_INTERVAL_DAYS = 21`

## Type

```ts
interface RefillResult {
  prescriptionId: string;
  status: "approved" | "denied";
  denialReason?: "limit_exceeded" | "too_soon" | "prescription_expired";
  remainingRefills: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องข้อจำกัดการเบิกซ้ำที่ [[business-logic/synthetic-health-records/prescription-refill-limit-policy]]
