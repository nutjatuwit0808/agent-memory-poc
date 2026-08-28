---
layer: business-logic
tags: [rate-limit, api, policy]
created: 2026-04-30
---

# นโยบาย Rate Limiting สำหรับ API Control Plane

API control plane ของ EdgeServe (สำหรับ tenant ตั้งค่า invalidation, geo-rule, certificate) มี rate limit แยกจาก data plane ของ content delivery — tenant แต่ละรายได้ API quota 1,000 request ต่อนาที สำหรับ invalidation request และ 100 request ต่อนาทีสำหรับ config update

Invalidation ที่ใช้ wildcard pattern กว้าง (เช่น `*`) นับเป็น 10 request แทนที่จะเป็น 1 request เพราะผลกระทบต่อ cache ใหญ่กว่า invalidation เฉพาะ URL — การออกแบบแบบนี้ทำให้ tenant ใช้ invalidation อย่างตั้งใจและไม่ invalidate แบบไม่จำเป็น
