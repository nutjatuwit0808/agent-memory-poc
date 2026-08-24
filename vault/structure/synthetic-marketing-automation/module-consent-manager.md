---
layer: structure
tags: [consent, compliance, module, core]
created: 2025-12-29
links:
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy]]"
---

# Module: consent-manager

เจ้าของสถานะ opt-in/opt-out ของผู้รับทุกคนในทุก channel (email, SMS) เป็นระบบที่ต้อง strict ที่สุดในทั้งแพลตฟอร์มเพราะผูกกับความเสี่ยงทางกฎหมายโดยตรง แยกออกมาเป็น service เดี่ยวตั้งแต่ต้นเพื่อไม่ให้ logic การส่งไปแตะข้อมูล consent โดยไม่ผ่านการตรวจสอบที่รัดกุม

## ฟังก์ชันหลัก
- `recordOptOut(contactId: string, channel: string, source: string): Promise<void>` — บันทึกการ unsubscribe ทันที มีผลทุก campaign ที่ยังไม่ส่งออกไป
- `checkConsentStatus(contactId: string, channel: string): Promise<ConsentStatus>` — เช็คสถานะ consent ล่าสุด เรียกได้บ่อยจึงต้อง cache แบบสั้นมากเท่านั้น
- `handleUnsubscribeWebhook(payload: UnsubscribeWebhookPayload): Promise<void>` — รับ webhook คลิก unsubscribe จาก ESP หรือ landing page ภายนอก

## State

opted_in → opted_out (ทางเดียว ไม่มี auto re-opt-in โดยไม่มี action ใหม่จากผู้รับ)

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-marketing-automation/module-send-scheduler]] query module นี้ตรงก่อนส่งทุก batch เสมอ ไม่มี service อื่นแตะข้อมูล consent ได้เลยแม้แต่การอ่าน ดู [[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy]] สำหรับ SLA เวลาที่ต้อง honor คำขอ
