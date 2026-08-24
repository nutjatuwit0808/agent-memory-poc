---
layer: structure
tags: [scheduling, module, core, reference, identifiers]
created: 2026-07-19
links:
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[business-logic/synthetic-marketing-automation/send-rate-throttle-policy]]"
---

# send-scheduler — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด send-scheduler สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-marketing-automation/module-send-scheduler]])

## Public functions
- `enqueueSendJob(campaignId: string, sendAt: string): Promise<string>` — สร้าง send job เข้าคิว คืน jobId
- `dispatchNextBatch(jobId: string): Promise<BatchResult>` — ส่ง batch ถัดไปตาม rate limit ที่กำหนด
- `pauseSendJob(jobId: string, reason: string): Promise<void>` — หยุด job ชั่วคราว เช่น เจอ bounce rate สูงผิดปกติกลาง batch

## Internal constants
- `SEND_BATCH_SIZE = 5000`
- `SEND_RATE_LIMIT_PER_MINUTE = 50000`

## Type

```ts
interface BatchResult {
  jobId: string;
  batchIndex: number;
  sent: number;
  suppressed: number;
  failed: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง throttle ที่ [[business-logic/synthetic-marketing-automation/send-rate-throttle-policy]]
