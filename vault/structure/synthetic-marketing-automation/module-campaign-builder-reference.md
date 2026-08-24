---
layer: structure
tags: [campaign, module, core, reference, identifiers]
created: 2026-04-15
links:
  - "[[structure/synthetic-marketing-automation/module-campaign-builder]]"
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[business-logic/synthetic-marketing-automation/campaign-scheduling-window-policy]]"
---

# campaign-builder — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด campaign-builder สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-marketing-automation/module-campaign-builder]])

## Public functions
- `createCampaignDraft(name: string, segmentId: string, templateId: string): Promise<Campaign>` — สร้าง draft ใหม่ ผูก segment และ template เข้าด้วยกัน
- `validateCampaign(campaignId: string): Promise<ValidationResult>` — ตรวจว่า campaign พร้อมส่งจริงหรือไม่ (มีลิงก์ unsubscribe, ไม่มี segment ว่างเปล่า ฯลฯ)
- `scheduleCampaign(campaignId: string, sendAt: string): Promise<void>` — ยืนยันตารางเวลาส่งแล้วส่ง event ให้ [[structure/synthetic-marketing-automation/module-send-scheduler]] รับช่วงต่อ
- `cloneCampaign(campaignId: string): Promise<Campaign>` — สร้าง draft ใหม่จาก campaign เดิม ใช้บ่อยสำหรับ campaign ประจำ (newsletter รายสัปดาห์)

## Internal constants
- `MAX_CAMPAIGN_DRAFT_AGE_DAYS = 90`
- `MIN_SCHEDULE_LEAD_MINUTES = 15`

## Type

```ts
interface Campaign {
  campaignId: string;
  status: "draft" | "validated" | "scheduled" | "sending" | "completed" | "failed";
  segmentId: string;
  templateId: string;
  sendAt: string | null;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-marketing-automation/campaign-scheduling-window-policy]]
