---
layer: deployment
tags: [migration, runbook]
created: 2025-11-28
links:
  - "[[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]]"
---

# Knowledge Base Index Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อองค์กรลูกค้าเปลี่ยนระบบจัดการเนื้อหาต้นทาง หรือปรับโครงสร้างหมวดหมู่บทความใหม่ทั้งหมด ต้อง migrate index ของ [[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]] แบบเต็มชุด

## ขั้นตอน

1) สร้าง index ใหม่แบบขนานกับ index เดิมโดยไม่ลบของเก่า 2) sync บทความทั้งหมดเข้า index ใหม่ 3) รัน query ทดสอบเทียบผลลัพธ์ index เก่ากับใหม่ 4) สลับ traffic มา index ใหม่แล้วเก็บ index เก่าไว้ 7 วันก่อนลบถาวร
