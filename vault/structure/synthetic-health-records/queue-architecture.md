---
layer: structure
tags: [health-records, vitalchart, queue, async]
created: 2026-03-08
links:
  - "[[structure/synthetic-health-records/module-audit-log-service]]"
  - "[[structure/synthetic-health-records/module-provider-access-control]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `record.accessed`, `record.amended`, `prescription.issued`, `lab_result.ingested`, `provider.access_revoked` — [[structure/synthetic-health-records/module-audit-log-service]] subscribe ทุก event เหล่านี้เพื่อบันทึกลง audit trail

[[structure/synthetic-health-records/module-provider-access-control]] subscribe `provider.access_revoked` เพื่อล้าง cache สิทธิ์การเข้าถึงทันที ไม่รอให้ cache หมดอายุตามปกติ เพราะการปล่อยให้ provider ที่ถูกเพิกถอนสิทธิ์ยังเข้าถึงข้อมูลได้แม้แค่ไม่กี่นาทีถือเป็นความเสี่ยงที่ยอมรับไม่ได้
