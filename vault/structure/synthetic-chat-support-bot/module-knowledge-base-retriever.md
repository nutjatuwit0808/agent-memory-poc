---
layer: structure
tags: [knowledge-base, module, core]
created: 2026-02-13
links:
  - "[[structure/synthetic-chat-support-bot/service-boundaries]]"
  - "[[structure/synthetic-chat-support-bot/module-intent-classifier]]"
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
---

# Module: knowledge-base-retriever

ค้นหาบทความช่วยเหลือที่เกี่ยวข้องกับ intent ที่จำแนกได้ เพื่อให้ bot ใช้ตอบลูกค้า ใช้ full-text search ผสม vector search บน index บทความที่ sync มาจากระบบจัดการเนื้อหาของทีม support แต่ละองค์กรลูกค้า

## ฟังก์ชันหลัก
- `retrieveArticles(intentLabel: string, queryText: string, topK: number): Promise<KbArticle[]>` — ค้นบทความที่เกี่ยวข้องที่สุด topK รายการ
- `syncArticleIndex(orgId: string): Promise<SyncResult>` — sync index บทความใหม่จากระบบจัดการเนื้อหาต้นทาง
- `flagStaleArticle(articleId: string, reason: string): Promise<void>` — ตีธงบทความที่สงสัยว่าล้าสมัยเพื่อให้ทีมเนื้อหาตรวจสอบ

## ความสัมพันธ์กับ module อื่น

ไม่รู้จัก state ของบทสนทนาเลย (ดู [[structure/synthetic-chat-support-bot/service-boundaries]]) — เมื่อ [[structure/synthetic-chat-support-bot/module-intent-classifier]] จำแนก intent เสร็จ จะเป็น [[structure/synthetic-chat-support-bot/module-conversation-state-manager]] ที่เรียก `retrieveArticles` แทนที่จะให้ knowledge-base-retriever ฟัง event การจำแนกโดยตรง เพื่อคุม fan-in ของ event ให้อยู่ที่จุดเดียว
