---
layer: business-logic
tags: [content, versioning, policy]
created: 2026-05-19
links:
  - "[[business-logic/synthetic-e-learning/certificate-revocation-policy]]"
---

# นโยบายการจัดการ Version ของ Course Content

เมื่อ course content ได้รับการอัปเดต ผู้เรียนที่ enroll ก่อนการอัปเดตจะยังคงเรียน version เดิมจนจบ ไม่ถูก force ให้เริ่มใหม่จาก version ใหม่กลางทาง ยกเว้นกรณีที่ content เปลี่ยนแปลงอย่างมีนัยสำคัญจนต้อง restart ซึ่ง course admin ต้อง flag และแจ้งล่วงหน้า

Certificate ที่ออกจาก version ใดก็ตามยังคง valid อยู่ตราบเท่าที่ไม่หมดอายุ ไม่มีการ invalidate certificate เดิมเพราะมี version ใหม่ เว้นแต่จะมีการ revoke ตาม [[business-logic/synthetic-e-learning/certificate-revocation-policy]] อย่างชัดเจน
