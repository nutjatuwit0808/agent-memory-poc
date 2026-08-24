---
layer: structure
tags: [scheduling, module, core]
created: 2026-06-08
links:
  - "[[structure/synthetic-marketing-automation/module-campaign-builder]]"
  - "[[structure/synthetic-marketing-automation/module-consent-manager]]"
  - "[[structure/synthetic-marketing-automation/service-boundaries]]"
  - "[[business-logic/synthetic-marketing-automation/send-rate-throttle-policy]]"
---

# Module: send-scheduler

จัดคิวและส่ง campaign จริงตามเวลาที่กำหนด แบ่งผู้รับเป็น batch ย่อยเพื่อควบคุมอัตราการส่งไม่ให้เกิน rate limit ของ ESP เป็น service เดียวที่ query ข้าม [[structure/synthetic-marketing-automation/module-campaign-builder]] และ [[structure/synthetic-marketing-automation/module-consent-manager]] พร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู [[structure/synthetic-marketing-automation/service-boundaries]])

## ฟังก์ชันหลัก
- `enqueueSendJob(campaignId: string, sendAt: string): Promise<string>` — สร้าง send job เข้าคิว คืน jobId
- `dispatchNextBatch(jobId: string): Promise<BatchResult>` — ส่ง batch ถัดไปตาม rate limit ที่กำหนด
- `pauseSendJob(jobId: string, reason: string): Promise<void>` — หยุด job ชั่วคราว เช่น เจอ bounce rate สูงผิดปกติกลาง batch

## State

queued → sending → completed | paused | failed

## ความสัมพันธ์กับ module อื่น

ก่อน `dispatchNextBatch` แต่ละครั้งต้อง re-check สถานะ consent ล่าสุดจาก [[structure/synthetic-marketing-automation/module-consent-manager]] เสมอ ไม่ใช้ snapshot ตอนสร้าง job เพราะผู้รับอาจ unsubscribe ไปแล้วระหว่างที่ job ยังส่งไม่ครบ ดู [[business-logic/synthetic-marketing-automation/send-rate-throttle-policy]]
