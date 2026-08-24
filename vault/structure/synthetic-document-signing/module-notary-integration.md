---
layer: structure
tags: [notary, module]
created: 2026-01-01
links:
  - "[[business-logic/synthetic-document-signing/notary-requirement-policy]]"
  - "[[structure/synthetic-document-signing/api-gateway]]"
---

# Module: notary-integration

เชื่อมต่อกับผู้ให้บริการรับรองเอกสารออนไลน์ (remote online notary) ภายนอกสำหรับเอกสารบางประเภทที่กฎหมายกำหนดว่าต้องมีพยานรับรองเพิ่มเติมจากการเซ็นปกติ เป็น service เดียวที่คุยกับระบบภายนอกฝั่งกฎหมาย/notary โดยตรง

## ฟังก์ชันหลัก
- `requestNotarySession(envelopeId: string, notaryProviderId: string): Promise<string>` — ขอ session รับรองเอกสารจากผู้ให้บริการภายนอก คืน sessionId
- `handleNotaryWebhook(payload: NotaryWebhookPayload): Promise<void>` — ประมวลผล webhook callback เมื่อ session เสร็จสิ้นหรือเปลี่ยนสถานะ
- `retryNotarySession(sessionId: string): Promise<void>` — ขอ session ใหม่เมื่อ session เดิมล้มเหลวหรือ timeout

## ความสัมพันธ์กับ module อื่น

เอกสารประเภทไหนต้องผ่าน notary กำหนดโดย [[business-logic/synthetic-document-signing/notary-requirement-policy]] — `handleNotaryWebhook` ไม่ผ่าน API gateway กลาง (ดู [[structure/synthetic-document-signing/api-gateway]]) เพราะต้อง verify signature ของ webhook ด้วยกลไกเฉพาะที่ต่างจาก authentication ของผู้ใช้ทั่วไป
