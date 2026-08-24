---
layer: structure
tags: [campaign, module, core]
created: 2025-12-08
links:
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[business-logic/synthetic-marketing-automation/campaign-scheduling-window-policy]]"
  - "[[structure/synthetic-marketing-automation/module-segment-engine]]"
  - "[[support-cases/synthetic-marketing-automation/case-8450]]"
---

# Module: campaign-builder

จุดสร้างและแก้ไข campaign ทั้งหมด ผูก template, segment เป้าหมาย, และตารางเวลาส่งเข้าด้วยกันเป็น draft ก่อนส่งต่อให้ [[structure/synthetic-marketing-automation/module-send-scheduler]] แยกออกมาจาก monolith เดิมตั้งแต่ปลายปี 2024 เพราะ logic การ validate เนื้อหาก่อนส่ง (เช่น ต้องมีลิงก์ unsubscribe เสมอ) ซับซ้อนขึ้นเรื่อยๆ

## ฟังก์ชันหลัก
- `createCampaignDraft(name: string, segmentId: string, templateId: string): Promise<Campaign>` — สร้าง draft ใหม่ ผูก segment และ template เข้าด้วยกัน
- `validateCampaign(campaignId: string): Promise<ValidationResult>` — ตรวจว่า campaign พร้อมส่งจริงหรือไม่ (มีลิงก์ unsubscribe, ไม่มี segment ว่างเปล่า ฯลฯ)
- `scheduleCampaign(campaignId: string, sendAt: string): Promise<void>` — ยืนยันตารางเวลาส่งแล้วส่ง event ให้ [[structure/synthetic-marketing-automation/module-send-scheduler]] รับช่วงต่อ
- `cloneCampaign(campaignId: string): Promise<Campaign>` — สร้าง draft ใหม่จาก campaign เดิม ใช้บ่อยสำหรับ campaign ประจำ (newsletter รายสัปดาห์)

## State

draft → validated → scheduled → sending → completed | failed — ดู [[business-logic/synthetic-marketing-automation/campaign-scheduling-window-policy]] สำหรับเงื่อนไขช่วงเวลาที่ส่งได้

## ความสัมพันธ์กับ module อื่น

ไม่แตะ segment membership โดยตรง — เรียก [[structure/synthetic-marketing-automation/module-segment-engine]] เพื่ออ่าน snapshot ล่าสุดตอน validate เท่านั้น ไม่ cache สมาชิกไว้เองในตาราง `campaigns` เพื่อป้องกันปัญหาข้อมูลเก่าค้าง ดู [[support-cases/synthetic-marketing-automation/case-8450]] สำหรับเหตุการณ์ที่เคยเกิดจากการ cache ผิดจุด
