---
layer: convention
tags: [compliance, security]
created: 2026-04-01
---

# PHI Handling Convention

PHI (Protected Health Information) คือข้อมูลใดๆ ที่ระบุตัวตนผู้ป่วยได้ร่วมกับข้อมูลสุขภาพ — เอกสารนี้กำหนดกฎการจัดการที่เข้มงวดกว่าข้อมูลทั่วไปทุกจุดที่แตะข้อมูลประเภทนี้

## การส่งข้อมูลระหว่าง service

PHI ที่ส่งข้าม service ต้องเข้ารหัสระหว่างทางเสมอ (in-transit encryption) และห้ามส่งผ่าน query string เด็ดขาด ต้องอยู่ใน request body เท่านั้น

## การเก็บใน log/monitoring

ระบบ monitoring และ log aggregation ทั้งหมดต้องผ่านการ scrub PHI ก่อนเข้า pipeline เสมอ — ทีมที่เพิ่ม field ใหม่ลง log ต้องยืนยันว่าไม่มี PHI ปนอยู่ก่อน merge
