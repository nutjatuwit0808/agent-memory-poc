---
layer: business-logic
tags: [license, drift, edge-case]
created: 2026-06-02
links:
  - "[[business-logic/synthetic-asset-management/license-overallocation-policy]]"
---

# ข้อยกเว้น: License Count Drift จากการ Override ด้วยมือ

ถ้าทีม IT เคย adjust จำนวน seat ด้วยมือผ่าน admin panel โดยไม่ผ่าน `syncLicenseCount` อย่างถูกต้อง ตัวเลขใน pool อาจ drift ออกจากตัวเลขจริงของ vendor จนเกณฑ์เตือนทำงานผิดพลาด

กรณีนี้ต้อง trigger `syncLicenseCount` ด้วยตัวเลขจาก vendor portal โดยตรงเพื่อ reset ตัวเลขให้ถูกต้อง แล้วตรวจสอบว่า allocation ทั้งหมดที่มีอยู่ยังอยู่ในขอบเขตจริง — ถ้ามี overallocation จริงหลัง sync ต้องระบุว่า seat ไหนต้องถูก revoke

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-asset-management/license-overallocation-policy]] ("นโยบายเกณฑ์ License Overallocation") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
