---
layer: structure
tags: [lab, module, core]
created: 2026-05-11
links:
  - "[[business-logic/synthetic-health-records/lab-result-duplicate-suppression-policy]]"
---

# Module: lab-result-ingest

รับผลตรวจแล็บจากห้องปฏิบัติการภายนอกหลายแห่งที่มีรูปแบบข้อมูลต่างกัน แปลงให้เป็นรูปแบบมาตรฐานเดียวก่อนบันทึกเข้าระบบ ต้องจับคู่ผลตรวจกับผู้ป่วยที่ถูกต้องอย่างแม่นยำเพราะความผิดพลาดตรงนี้ส่งผลกระทบร้ายแรงต่อการรักษาได้

## ฟังก์ชันหลัก
- `ingestLabResult(rawPayload: unknown, sourceLabId: string): Promise<IngestResult>` — รับ payload ดิบจากแล็บภายนอก แปลงและ validate ก่อนบันทึก
- `matchPatient(labPayload: LabPayload): Promise<string | null>` — จับคู่ผลตรวจกับ patientId ที่ถูกต้อง คืน null ถ้าจับคู่ไม่ได้แน่ชัด
- `flagCriticalValue(resultId: string, value: number, referenceRange: Range): Promise<void>` — ตรวจว่าค่าที่ได้อยู่ในระดับวิกฤตต้องแจ้งเตือนด่วนไหม

## ความสัมพันธ์กับ module อื่น

ถ้า `matchPatient` จับคู่ไม่ได้แน่ชัด (คืน null) ระบบจะไม่เดาหรือบันทึกเข้าระบบโดยอัตโนมัติเด็ดขาด จะส่งเข้าคิวตรวจสอบด้วยมือแทนเสมอ ดู [[business-logic/synthetic-health-records/lab-result-duplicate-suppression-policy]]
