---
layer: structure
tags: [content-delivery, edgeserve, queue, async]
created: 2026-06-05
links:
  - "[[structure/synthetic-content-delivery/module-invalidation-dispatcher]]"
  - "[[structure/synthetic-content-delivery/module-certificate-manager]]"
  - "[[business-logic/synthetic-content-delivery/certificate-renewal-policy]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `cache.invalidation_requested`, `cache.invalidation_propagated`, `origin.pull_failed`, `cert.renewal_due`, `cert.renewal_succeeded` — [[structure/synthetic-content-delivery/module-invalidation-dispatcher]] เป็นทั้งผู้ publish และ subscribe event ที่เกี่ยวกับ invalidation เพื่อ track ว่า edge node แต่ละจุด acknowledge แล้วหรือยัง

[[structure/synthetic-content-delivery/module-certificate-manager]] subscribe `cert.renewal_due` ที่ตัวเองสร้างขึ้นแบบ scheduled เพื่อ trigger กระบวนการต่ออายุ ACME — ออกแบบแบบนี้เพื่อให้กระบวนการ renewal retryable ด้วยตัวเอง ถ้า renewal ล้มเหลวในรอบแรก event จะถูก requeue ตาม [[business-logic/synthetic-content-delivery/certificate-renewal-policy]] จนกว่าจะสำเร็จหรือเกิน deadline
