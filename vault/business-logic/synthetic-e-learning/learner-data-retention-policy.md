---
layer: business-logic
tags: [data-retention, privacy, policy]
created: 2026-06-16
---

# นโยบายการเก็บรักษาข้อมูลของผู้เรียน

ข้อมูล learning progress และ assessment result เก็บไว้ตลอดช่วงที่พนักงานยังทำงานในองค์กร บวก 7 ปีหลังออกจากองค์กร เพื่อรองรับ audit requirement ของ regulatory body บางแห่ง ข้อมูล certificate ที่ออกไปแล้วไม่ถูกลบเลยเพราะใช้ verify ได้ตลอดอายุ certificate

ข้อมูลที่ระบุตัวตนของผู้เรียน (ชื่อ, email, learner_id) สามารถ anonymize ได้หลังจากออกจากองค์กรครบ 7 ปี แต่ aggregate statistics เช่น pass rate ต่อคอร์สยังคงเก็บไว้สำหรับ analytics โดยไม่มี expiry
