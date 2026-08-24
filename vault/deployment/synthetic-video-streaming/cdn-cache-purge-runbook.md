---
layer: deployment
tags: [cdn, runbook, cache]
created: 2026-03-01
links:
  - "[[business-logic/synthetic-video-streaming/origin-shield-cache-policy]]"
  - "[[business-logic/synthetic-video-streaming/content-takedown-policy]]"
  - "[[structure/synthetic-video-streaming/module-cdn-origin-shield]]"
---

# CDN Cache Purge Runbook

ขั้นตอนสำหรับ purge cache เป็นวงกว้างตามที่กำหนดไว้ใน [[business-logic/synthetic-video-streaming/origin-shield-cache-policy]] และ [[business-logic/synthetic-video-streaming/content-takedown-policy]]

## Purge แบบเจาะจง asset

ใช้ `purgeCache` ระบุ pattern ของ path เฉพาะ asset นั้น ใช้เวลากระจายไป edge node ทั้งหมดไม่เกิน 5 นาที

## Purge แบบวงกว้าง (ทั้ง CDN)

ต้องมีการอนุมัติจากหัวหน้าทีมก่อนเสมอ เพราะระหว่าง purge cache hit rate จะตกลงชั่วคราวและภาระตกไปที่ [[structure/synthetic-video-streaming/module-cdn-origin-shield]] กับ origin จริงทันที ควรทำนอกช่วง primetime window เท่านั้น
