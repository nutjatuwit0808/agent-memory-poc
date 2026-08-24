---
layer: structure
tags: [chat-support-bot, helploop, database, schema]
created: 2026-03-11
links:
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-chat-support-bot/module-conversation-state-manager]] ดูแล ได้แก่ `conversations` (สถานะปัจจุบันของแต่ละบทสนทนา) และ `conversation_turns` (ประวัติข้อความทุก turn ไม่ลบทิ้งเพื่อ audit และ retrain)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `conversations` | conversation-state-manager | อัปเดตทุกครั้งที่มี turn ใหม่ |
| `kb_articles_index` | knowledge-base-retriever | index บทความช่วยเหลือ ไม่เก็บเนื้อหาเต็ม |
| `handoff_queue` | handoff-router | คิวรอเจ้าหน้าที่รับสาย |
| `rate_limit_buckets` | rate-limiter | token bucket ต่อ customer account |

ทุกตารางใช้ `conversationId` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายวันที่เทียบจำนวน turn กับจำนวนที่ knowledge-base-retriever log ไว้ว่าถูกเรียกใช้
