---
layer: business-logic
tags: [safety, policy]
created: 2025-12-25
links:
  - "[[structure/synthetic-warehouse-robotics/module-safety-zone-monitor]]"
  - "[[business-logic/synthetic-warehouse-robotics/safety-zone-violation-policy-edge-cases]]"
---

# นโยบายเมื่อมีคนเข้าโซนทำงานของหุ่นยนต์

เมื่อ [[structure/synthetic-warehouse-robotics/module-safety-zone-monitor]] ตรวจพบคนเข้าโซนที่หุ่นยนต์กำลังทำงาน ระบบจะสั่ง emergency stop หุ่นยนต์ทุกตัวในโซนนั้นทันทีโดยไม่รอการยืนยัน (fail-safe ก่อน แล้วค่อยตรวจสอบทีหลัง)

การปลดล็อกโซนต้องมีพนักงานที่ผ่านการอบรมยืนยันด้วยมือผ่าน `clearZoneAlert` เท่านั้น ระบบจะไม่ปลดล็อกอัตโนมัติแม้เซ็นเซอร์จะกลับมาไม่พบคนแล้วก็ตาม

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-warehouse-robotics/safety-zone-violation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
