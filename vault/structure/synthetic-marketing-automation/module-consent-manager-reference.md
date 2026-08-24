---
layer: structure
tags: [consent, compliance, module, core, reference, identifiers]
created: 2026-01-26
links:
  - "[[structure/synthetic-marketing-automation/module-consent-manager]]"
  - "[[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy]]"
---

# consent-manager — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด consent-manager สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-marketing-automation/module-consent-manager]])

## Public functions
- `recordOptOut(contactId: string, channel: string, source: string): Promise<void>` — บันทึกการ unsubscribe ทันที มีผลทุก campaign ที่ยังไม่ส่งออกไป
- `checkConsentStatus(contactId: string, channel: string): Promise<ConsentStatus>` — เช็คสถานะ consent ล่าสุด เรียกได้บ่อยจึงต้อง cache แบบสั้นมากเท่านั้น
- `handleUnsubscribeWebhook(payload: UnsubscribeWebhookPayload): Promise<void>` — รับ webhook คลิก unsubscribe จาก ESP หรือ landing page ภายนอก

## Internal constants
- `CONSENT_CACHE_TTL_SECONDS = 30`
- `UNSUBSCRIBE_HONOR_SLA_HOURS = 24`

## Type

```ts
interface ConsentStatus {
  contactId: string;
  channel: "email" | "sms";
  status: "opted_in" | "opted_out";
  updatedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง SLA การ honor unsubscribe ที่ [[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy]]
