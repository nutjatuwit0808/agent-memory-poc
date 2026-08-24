---
layer: structure
tags: [lab, module, core, reference, identifiers]
created: 2026-03-02
links:
  - "[[structure/synthetic-health-records/module-lab-result-ingest]]"
  - "[[business-logic/synthetic-health-records/lab-result-critical-value-alert-policy]]"
---

# lab-result-ingest — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด lab-result-ingest สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-health-records/module-lab-result-ingest]])

## Public functions
- `ingestLabResult(rawPayload: unknown, sourceLabId: string): Promise<IngestResult>` — รับ payload ดิบจากแล็บภายนอก แปลงและ validate ก่อนบันทึก
- `matchPatient(labPayload: LabPayload): Promise<string | null>` — จับคู่ผลตรวจกับ patientId ที่ถูกต้อง คืน null ถ้าจับคู่ไม่ได้แน่ชัด
- `flagCriticalValue(resultId: string, value: number, referenceRange: Range): Promise<void>` — ตรวจว่าค่าที่ได้อยู่ในระดับวิกฤตต้องแจ้งเตือนด่วนไหม

## Internal constants
- `PATIENT_MATCH_CONFIDENCE_THRESHOLD = 0.98`
- `CRITICAL_VALUE_ALERT_TIMEOUT_MIN = 15`

## Type

```ts
interface IngestResult {
  resultId: string;
  status: "matched" | "pending_manual_match" | "rejected_format";
  matchConfidence?: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการแจ้งเตือนค่าวิกฤตที่ [[business-logic/synthetic-health-records/lab-result-critical-value-alert-policy]]
