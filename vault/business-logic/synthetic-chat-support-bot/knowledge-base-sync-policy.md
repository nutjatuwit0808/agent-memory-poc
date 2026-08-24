---
layer: business-logic
tags: [knowledge-base, sync, policy]
created: 2026-05-16
links:
  - "[[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]]"
  - "[[business-logic/synthetic-chat-support-bot/knowledge-base-sync-policy-edge-cases]]"
---

# นโยบายการ Sync Knowledge Base

[[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]] sync index บทความจากระบบจัดการเนื้อหาต้นทางทุก `ARTICLE_INDEX_SYNC_INTERVAL_MIN` (ค่าปกติ 60 นาที) เป็น background job ไม่ได้ sync แบบ real-time ทุกครั้งที่ทีมเนื้อหาแก้บทความ เพื่อไม่ให้ query volume จากการ sync ไปกระทบ latency ของการค้นหาจริง

บทความที่ถูกลบที่ต้นทางจะถูกตัดออกจาก index ทันทีในรอบ sync ถัดไป ไม่รอให้หมดอายุเอง เพื่อไม่ให้ bot อ้างอิงบทความที่ทีมเนื้อหาตั้งใจถอนออกแล้ว

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-chat-support-bot/knowledge-base-sync-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
