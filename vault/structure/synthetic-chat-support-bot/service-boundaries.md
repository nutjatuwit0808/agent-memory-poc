---
layer: structure
tags: [chat-support-bot, helploop, boundaries]
created: 2026-01-25
links:
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
  - "[[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]]"
  - "[[structure/synthetic-chat-support-bot/module-handoff-router]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-chat-support-bot/module-conversation-state-manager]] เป็นเจ้าของ state ของบทสนทนาทั้งหมด (ขั้นตอนปัจจุบัน, ประวัติข้อความล่าสุด) ส่วน [[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]] เป็นเจ้าของ index บทความช่วยเหลือเท่านั้น ไม่รู้จัก state การสนทนาเลย

[[structure/synthetic-chat-support-bot/module-handoff-router]] เป็น service เดียวที่ query ข้าม [[structure/synthetic-chat-support-bot/module-conversation-state-manager]] (เพื่อรู้ประวัติการคุยทั้งหมดก่อนส่งต่อ) และคิวเจ้าหน้าที่ (เพื่อรู้ว่าใครว่าง) พร้อมกัน — เหตุผลที่ยอมให้ทำ cross-domain query (ผิดหลักทั่วไป) คือเจ้าหน้าที่ที่รับช่วงต่อต้องเห็นบริบทเต็มและมีคนว่างพร้อมกันในเวลาที่ตัดสินใจส่งต่อ ไม่งั้นลูกค้าจะถูกโยนไปหาเจ้าหน้าที่ที่ไม่มีบริบทหรือคิวที่ไม่มีใครรับ
