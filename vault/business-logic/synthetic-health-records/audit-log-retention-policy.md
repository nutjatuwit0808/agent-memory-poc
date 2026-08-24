---
layer: business-logic
tags: [audit, compliance, policy]
created: 2025-09-26
links:
  - "[[business-logic/synthetic-health-records/audit-log-retention-policy-edge-cases]]"
---

# นโยบายการเก็บรักษา Audit Log

audit log ทุกรายการต้องเก็บไว้อย่างน้อย `RECORD_VERSION_RETENTION_YEARS` ปี ตรงกับระยะเวลาที่กฎหมายกำหนดสำหรับเวชระเบียน ไม่มีการลบทิ้งก่อนครบกำหนดไม่ว่ากรณีใด

แม้บัญชีผู้ป่วยจะถูกปิดหรือ provider จะออกจากระบบไปแล้ว audit log ที่เกี่ยวข้องยังคงถูกเก็บไว้ครบตามระยะเวลาเดิม ไม่ถูกลบตามไปด้วย

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-health-records/audit-log-retention-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
