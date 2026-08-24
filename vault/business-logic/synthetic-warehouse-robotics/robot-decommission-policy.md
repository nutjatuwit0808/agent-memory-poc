---
layer: business-logic
tags: [fleet, lifecycle, policy]
created: 2025-09-14
links:
  - "[[deployment/synthetic-warehouse-robotics/fleet-firmware-deployment-runbook]]"
---

# นโยบายการปลดระวางหุ่นยนต์

หุ่นยนต์ที่เข้า `critical fault` เกิน 3 ครั้งในรอบ 30 วัน หรืออายุการใช้งานแบตเตอรี่เกิน 18 เดือน จะถูกเสนอเข้ากระบวนการปลดระวาง โดยทีมซ่อมบำรุงเป็นผู้อนุมัติสุดท้าย ไม่ใช่ระบบอัตโนมัติ

ก่อนปลดระวางจริง ต้องแน่ใจว่าไม่มี task ค้างอยู่กับหุ่นยนต์ตัวนั้น ดูขั้นตอนเต็มที่ [[deployment/synthetic-warehouse-robotics/fleet-firmware-deployment-runbook]]
