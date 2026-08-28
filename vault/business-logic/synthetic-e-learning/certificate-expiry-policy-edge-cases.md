---
layer: business-logic
tags: [certificate, expiry, edge-case]
created: 2025-11-21
links:
  - "[[business-logic/synthetic-e-learning/certificate-expiry-policy]]"
---

# ข้อยกเว้น: Certificate หมดอายุระหว่าง Active Compliance Period

ถ้า certificate ของพนักงานหมดอายุในช่วงที่ยังอยู่ระหว่างโปรเจกต์ที่ต้องการ certification นั้นอยู่ การ revoke access ทันทีอาจกระทบ business continuity ได้ กรณีนี้ HR admin สามารถ request grace period ได้ไม่เกิน 30 วันสำหรับการต่ออายุ certificate

Grace period ต้องได้รับอนุมัติจาก compliance officer และต้องมีหลักฐานว่าพนักงานได้ลง enroll คอร์สต่ออายุแล้ว ไม่ใช่แค่ขอ grace period ล่วงหน้าโดยไม่มีแผน grace period ไม่ extend ซ้ำ หมดแล้วต้องต่ออายุจริงก่อนใช้ certificate ต่อไป

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-e-learning/certificate-expiry-policy]] ("นโยบายอายุและการต่ออายุ Certificate") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
