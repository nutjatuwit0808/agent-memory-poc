---
layer: business-logic
tags: [privacy, policy]
created: 2026-08-17
links:
  - "[[business-logic/synthetic-telematics/accident-evidence-retention-policy]]"
---

# นโยบายความเป็นส่วนตัวและการเก็บรักษาข้อมูล GPS

ข้อมูล GPS trace ดิบเก็บรักษาตาม `GPS_TRACE_RETENTION_DAYS` เท่านั้น หลังจากนั้นจะถูกลบถาวร ยกเว้นข้อมูลที่เกี่ยวข้องกับหลักฐานอุบัติเหตุที่มีระยะเวลาเก็บรักษาแยกต่างหากตาม [[business-logic/synthetic-telematics/accident-evidence-retention-policy]]

ผู้ขับมีสิทธิ์ขอลบข้อมูลตำแหน่งของตัวเองก่อนครบกำหนดได้ผ่านคำร้องพิเศษ ยกเว้นข้อมูลที่ผูกกับหลักฐานอุบัติเหตุที่อยู่ระหว่างกระบวนการเคลมซึ่งไม่สามารถลบก่อนกำหนดได้
