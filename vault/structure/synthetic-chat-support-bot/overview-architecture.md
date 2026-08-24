---
layer: structure
tags: [chat-support-bot, helploop, architecture, overview]
created: 2026-04-18
links:
  - "[[structure/synthetic-chat-support-bot/module-intent-classifier]]"
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
  - "[[structure/synthetic-chat-support-bot/module-handoff-router]]"
  - "[[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]]"
  - "[[structure/synthetic-chat-support-bot/module-session-store]]"
  - "[[structure/synthetic-chat-support-bot/module-rate-limiter]]"
---

# ภาพรวมสถาปัตยกรรม HelpLoop — แพลตฟอร์ม Chat Support Bot

HelpLoop คือแพลตฟอร์ม chat bot สำหรับทีม customer support ขององค์กรลูกค้าแต่ละราย รับข้อความจากช่องทางแชทของลูกค้าปลายทาง (เว็บวิดเจ็ต, LINE, มือถือ) แล้วตอบด้วย bot อัตโนมัติก่อน ถ้า bot ตอบไม่ได้จริงๆ ค่อยส่งต่อให้เจ้าหน้าที่คน (handoff) ระบบแบ่งงานเป็นสองส่วนหลัก คือ "เข้าใจว่าลูกค้าต้องการอะไร" (intent + retrieval) กับ "คุยต่อเนื่องให้จบบทสนทนา" (state + handoff)

ทีมวิศวกรรมแยก service ตามความรับผิดชอบชัดเจน เพราะบทเรียนจากระบบรุ่นก่อนที่รวม logic การจำแนก intent กับการจัดการ state การสนทนาไว้ใน service เดียวจนแก้ไขยาก บั๊กจุดหนึ่งกระทบทั้งระบบ ช่วงเวลาที่ทีมเรียกว่า peak support window (09:00-11:00 และ 13:00-15:00) คือช่วงที่ปริมาณข้อความเข้าสูงสุดของแต่ละวัน ตรงกับเวลาที่ลูกค้าองค์กรเปิดทำการ

## Module หลัก

- **intent-classifier** — รับผิดชอบจำแนกว่าข้อความของลูกค้าต้องการอะไร (เช่น ถามสถานะ, ขอความช่วยเหลือ, ร้ ดู [[structure/synthetic-chat-support-bot/module-intent-classifier]]
- **conversation-state-manager** — เจ้าของ state ของทุกบทสนทนา (ขั้นตอนปัจจุบัน, ประวัติ turn ล่าสุด, ว่าอยู่ระหว่า ดู [[structure/synthetic-chat-support-bot/module-conversation-state-manager]]
- **handoff-router** — ตัดสินใจว่าเมื่อไหร่ต้องส่งบทสนทนาต่อให้เจ้าหน้าที่คน และจับคู่กับเจ้าหน้าที่ที่ ดู [[structure/synthetic-chat-support-bot/module-handoff-router]]
- **knowledge-base-retriever** — ค้นหาบทความช่วยเหลือที่เกี่ยวข้องกับ intent ที่จำแนกได้ เพื่อให้ bot ใช้ตอบลูกค้ ดู [[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]]
- **session-store** — จัดการ session ของลูกค้าที่เชื่อมต่ออยู่ผ่าน WebSocket รวมถึงสัญญาณ presence และ ดู [[structure/synthetic-chat-support-bot/module-session-store]]
- **rate-limiter** — จำกัดอัตราข้อความที่แต่ละ customer account ส่งเข้ามาได้ ป้องกันทั้งการโจมตีแบบ s ดู [[structure/synthetic-chat-support-bot/module-rate-limiter]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-chat-support-bot/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-chat-support-bot/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-chat-support-bot/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-chat-support-bot/database-schema]]
