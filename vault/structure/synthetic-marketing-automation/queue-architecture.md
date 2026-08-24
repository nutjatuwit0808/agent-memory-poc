---
layer: structure
tags: [marketing-automation, wavecast, queue, async]
created: 2025-09-06
links:
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[structure/synthetic-marketing-automation/module-consent-manager]]"
  - "[[structure/synthetic-marketing-automation/module-deliverability-monitor]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `campaign.scheduled`, `send.batch_dispatched`, `send.bounced`, `send.complained`, `consent.opted_out`, `deliverability.domain_flagged` — [[structure/synthetic-marketing-automation/module-send-scheduler]] เป็นทั้งผู้ publish และ subscribe เพราะต้อง react ต่อผลลัพธ์ของ batch ที่ตัวเองส่งไป

[[structure/synthetic-marketing-automation/module-consent-manager]] subscribe `send.complained` โดยตรงเพื่อพิจารณา auto-suppress ผู้รับที่ complain ซ้ำหลายครั้ง โดยไม่ต้องรอให้ [[structure/synthetic-marketing-automation/module-deliverability-monitor]] ประมวลผลภาพรวมก่อน ออกแบบแบบนี้เพื่อให้การป้องกันสิทธิ์ผู้รับทำงานได้เร็วที่สุดแม้ deliverability-monitor จะล่ม
