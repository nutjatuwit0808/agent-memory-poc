---
layer: structure
tags: [health-records, vitalchart, architecture, overview]
created: 2026-08-01
links:
  - "[[structure/synthetic-health-records/module-patient-record-store]]"
  - "[[structure/synthetic-health-records/module-appointment-scheduler]]"
  - "[[structure/synthetic-health-records/module-prescription-manager]]"
  - "[[structure/synthetic-health-records/module-lab-result-ingest]]"
  - "[[structure/synthetic-health-records/module-provider-access-control]]"
  - "[[structure/synthetic-health-records/module-audit-log-service]]"
---

# ภาพรวมสถาปัตยกรรม VitalChart — ระบบจัดการเวชระเบียนผู้ป่วย

VitalChart คือแพลตฟอร์มจัดการเวชระเบียนอิเล็กทรอนิกส์สำหรับคลินิกและโรงพยาบาลขนาดกลาง ครอบคลุมตั้งแต่บันทึกประวัติผู้ป่วย การนัดหมาย การสั่งยา ไปจนถึงผลตรวจแล็บ ระบบต้องออกแบบให้สอดคล้องกับข้อกำหนดด้าน compliance เรื่องข้อมูลสุขภาพที่เข้มงวดกว่าระบบทั่วไปมาก

ทีมวิศวกรรมแยก service ตามขอบเขตความรับผิดชอบชัดเจน โดยเฉพาะเรื่องสิทธิ์การเข้าถึงข้อมูล (access control) ที่ต้องผูกกับความสัมพันธ์การรักษาจริงระหว่างแพทย์กับผู้ป่วย ไม่ใช่แค่ role ทั่วไปแบบระบบอื่น และทุก action ที่แตะข้อมูลผู้ป่วยต้องถูกบันทึกลง audit log แบบที่แก้ไขย้อนหลังไม่ได้

## Module หลัก

- **patient-record-store** — เจ้าของข้อมูลประวัติผู้ป่วยหลักทั้งหมด (ข้อมูลส่วนตัว, ประวัติการวินิจฉัย, บันทึ ดู [[structure/synthetic-health-records/module-patient-record-store]]
- **appointment-scheduler** — จัดการการนัดหมายระหว่างผู้ป่วยกับแพทย์ ตรวจสอบความว่างของตารางเวลาแพทย์แต่ละคนแล ดู [[structure/synthetic-health-records/module-appointment-scheduler]]
- **prescription-manager** — จัดการการสั่งยาและติดตามการเบิกซ้ำ (refill) ตรวจสอบข้อจำกัดปริมาณและความถี่ตามที ดู [[structure/synthetic-health-records/module-prescription-manager]]
- **lab-result-ingest** — รับผลตรวจแล็บจากห้องปฏิบัติการภายนอกหลายแห่งที่มีรูปแบบข้อมูลต่างกัน แปลงให้เป็น ดู [[structure/synthetic-health-records/module-lab-result-ingest]]
- **provider-access-control** — ตัดสินใจว่าแพทย์/พยาบาลคนไหนเข้าถึงข้อมูลผู้ป่วยรายไหนได้บ้าง ผูกกับความสัมพันธ์ ดู [[structure/synthetic-health-records/module-provider-access-control]]
- **audit-log-service** — บันทึกทุก action ที่เกี่ยวกับข้อมูลผู้ป่วยแบบ append-only แก้ไขหรือลบย้อนหลังไม่ ดู [[structure/synthetic-health-records/module-audit-log-service]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-health-records/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-health-records/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-health-records/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-health-records/database-schema]]
