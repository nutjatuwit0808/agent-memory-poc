---
layer: structure
tags: [health-records, vitalchart, boundaries]
created: 2025-12-03
links:
  - "[[structure/synthetic-health-records/module-patient-record-store]]"
  - "[[structure/synthetic-health-records/module-prescription-manager]]"
  - "[[structure/synthetic-health-records/module-audit-log-service]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-health-records/module-patient-record-store]] เป็นเจ้าของข้อมูลประวัติผู้ป่วยหลักทั้งหมด ส่วน [[structure/synthetic-health-records/module-prescription-manager]] เก็บแค่ประวัติการสั่งยา ไม่เก็บข้อมูลการวินิจฉัยหรือผลแล็บเลย

[[structure/synthetic-health-records/module-audit-log-service]] เป็น service เดียวที่ทุก service อื่นต้องเรียกทุกครั้งที่มีการเข้าถึงหรือแก้ไขข้อมูลผู้ป่วย ไม่มี service ไหนเขียน audit log ของตัวเองแยกต่างหาก เพื่อให้มีแหล่งความจริงเดียวสำหรับการตรวจสอบ compliance
