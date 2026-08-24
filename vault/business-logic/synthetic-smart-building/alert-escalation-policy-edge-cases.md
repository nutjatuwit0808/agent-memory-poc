---
layer: business-logic
tags: [alerting, safety, edge-case]
created: 2025-12-31
links:
  - "[[structure/synthetic-smart-building/module-access-control-gateway]]"
  - "[[business-logic/synthetic-smart-building/alert-escalation-policy]]"
---

# ข้อยกเว้นสำหรับ Alert ด้านความปลอดภัยที่เกี่ยวกับ Access Control

alert ที่มาจาก [[structure/synthetic-smart-building/module-access-control-gateway]] เกี่ยวกับความปลอดภัย (เช่น ประตูทางออกฉุกเฉินถูกล็อกผิดพลาด, fire panel ส่งสัญญาณแต่ไม่มี response) จะถูกจัดเป็น `critical` เสมอไม่ว่า module ต้นทางจะส่งระดับความรุนแรงมาเป็นอะไรก็ตาม — alert-dispatcher มีรายการ event type พิเศษที่ force-upgrade ระดับความรุนแรงแบบนี้อยู่ล่วงหน้า

alert กลุ่มนี้ยังข้าม quiet hours ไปด้วย แม้จะเป็นช่วง 22:00-06:00 ก็ page ทันทีเสมอ เพราะความเสี่ยงด้านความปลอดภัยทางกายภาพสำคัญกว่าความรำคาญจากการถูกปลุกกลางดึก

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-smart-building/alert-escalation-policy]] ("นโยบายการยกระดับ Alert ที่ไม่มีคน Acknowledge") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
