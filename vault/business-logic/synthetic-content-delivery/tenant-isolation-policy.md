---
layer: business-logic
tags: [tenant, isolation, policy]
created: 2026-07-22
links:
  - "[[support-cases/synthetic-content-delivery/case-5216]]"
---

# นโยบาย Tenant Isolation

Cache key ของทุก tenant ถูก namespace ด้วย `tenant_id` เพื่อป้องกัน cache pollution ข้าม tenant แม้ content URL จะเหมือนกัน — tenant A และ tenant B ที่มี origin URL เดียวกันยังคงมี cache entry แยกกันอย่างสมบูรณ์

Bandwidth quota, rate limit, geo-restriction rule, และ certificate ของแต่ละ tenant เป็น resource ที่แยกกันอย่างสิ้นเชิง ไม่มีการ share ข้าม tenant ในรูปแบบใดๆ ทั้งในเชิง data และ capacity — ดู [[support-cases/synthetic-content-delivery/case-5216]] สำหรับกรณีที่ isolation มีข้อผิดพลาด
