---
layer: structure
tags: [health-records, vitalchart, gateway, api]
created: 2026-05-06
links:
  - "[[structure/synthetic-health-records/module-provider-access-control]]"
  - "[[business-logic/synthetic-health-records/emergency-access-break-glass-policy]]"
---

# API Gateway

คำขอจากแอปของแพทย์/พยาบาลเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ token และแนบข้อมูลผู้เรียกไปกับทุก request ก่อนส่งต่อให้ [[structure/synthetic-health-records/module-provider-access-control]] ตัดสินใจว่าอนุญาตหรือไม่

คำขอฉุกเฉิน (break-glass access) ใช้ endpoint แยกต่างหากที่ผ่าน gateway เดียวกันแต่มี logic ยืนยันตัวตนเพิ่มเติมและบังคับเขียน audit log ทันทีก่อนคืนผลลัพธ์ ดู [[business-logic/synthetic-health-records/emergency-access-break-glass-policy]]
