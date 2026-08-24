---
layer: structure
tags: [rate-limit, module]
created: 2025-09-19
links:
  - "[[structure/synthetic-chat-support-bot/module-intent-classifier]]"
  - "[[business-logic/synthetic-chat-support-bot/rate-limit-policy]]"
---

# Module: rate-limiter

จำกัดอัตราข้อความที่แต่ละ customer account ส่งเข้ามาได้ ป้องกันทั้งการโจมตีแบบ spam และการเผลอส่งข้อความซ้ำถี่จาก integration ของลูกค้าองค์กรที่ผิดพลาด ทำงานเป็น synchronous check ก่อน pipeline อื่นเสมอ

## ฟังก์ชันหลัก
- `checkLimit(accountId: string, channel: ChannelType): Promise<RateLimitDecision>` — ตรวจว่า account นี้ยังส่งข้อความได้ตาม token bucket ที่เหลือหรือไม่
- `consumeToken(accountId: string): Promise<void>` — หักโทเคนออกจาก bucket เมื่อข้อความผ่านการตรวจแล้ว
- `resetBucket(accountId: string, reason: string): Promise<void>` — รีเซ็ต bucket ด้วยมือ เช่นเมื่อยืนยันว่าเป็น traffic ที่ถูกต้องจริง

## ความสัมพันธ์กับ module อื่น

ทำงานก่อน [[structure/synthetic-chat-support-bot/module-intent-classifier]] เสมอในทุก pipeline — ข้อความที่ถูก throttle จะไม่ถูกส่งเข้าสู่ intent-classifier เลยเพื่อประหยัดทรัพยากร ดู [[business-logic/synthetic-chat-support-bot/rate-limit-policy]]
