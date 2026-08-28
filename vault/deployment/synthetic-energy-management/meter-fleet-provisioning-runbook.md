---
layer: deployment
tags: [meter, runbook]
created: 2025-12-22
---

# Meter Fleet Provisioning Runbook

ขั้นตอนการเพิ่ม meter ใหม่เข้าระบบเมื่อติดตั้ง facility ใหม่หรือขยาย fleet ของ facility เดิม

## ก่อนเปิดใช้งาน

ต้องลงทะเบียน meter ใน `meter_registry` และตั้งค่า baseline เริ่มต้นก่อนเชื่อมต่อจริง ไม่ปล่อยให้ meter ส่งข้อมูลเข้าระบบก่อนมี baseline อ้างอิง

## หลังเปิดใช้งาน

ตรวจสอบว่า meter ส่งข้อมูลสม่ำเสมออย่างน้อย 48 ชั่วโมงก่อนเปิดใช้การแจ้งเตือน anomaly เพื่อให้มีข้อมูลเพียงพอสำหรับ baseline เริ่มต้นที่แม่นยำ
