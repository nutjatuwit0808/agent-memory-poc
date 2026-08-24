---
layer: structure
tags: [thumbnail, module]
created: 2025-10-06
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[structure/synthetic-video-streaming/queue-architecture]]"
  - "[[business-logic/synthetic-video-streaming/thumbnail-extraction-timing-policy]]"
---

# Module: thumbnail-extractor

ดึงภาพนิ่งจากวิดีโอเพื่อทำ poster image และ sprite sheet สำหรับแถบ scrub บนผู้เล่น ทำงานเป็น background job แยกจาก critical path การ transcode เพื่อไม่ให้ thumbnail ที่ช้าไปถ่วงเวลาที่วิดีโอพร้อมเล่นได้จริง

## ฟังก์ชันหลัก
- `extractSprite(assetId: string, intervalSec: number): Promise<SpriteSheet>` — ดึงภาพนิ่งทุก intervalSec วินาทีมาต่อเป็น sprite sheet เดียว
- `extractPoster(assetId: string, timestampSec: number): Promise<string>` — ดึงภาพนิ่ง 1 เฟรมที่ timestamp ที่กำหนดเป็นภาพหน้าปก
- `regenerateThumbnails(assetId: string): Promise<void>` — สั่งสร้าง thumbnail ใหม่ทั้งชุด เช่นเมื่อ publisher เปลี่ยน timestamp ภาพหน้าปกเอง

## ความสัมพันธ์กับ module อื่น

รอ event `transcode.job.completed` จาก [[structure/synthetic-video-streaming/module-transcode-worker]] ก่อนเริ่มทำงานเสมอ (ดู [[structure/synthetic-video-streaming/queue-architecture]]) เพื่อดึงภาพจาก rendition คุณภาพสูงสุดที่มี ไม่ใช่จากไฟล์ต้นฉบับตรงๆ ซึ่งอาจมี codec ที่ extractor ไม่รองรับ ดู [[business-logic/synthetic-video-streaming/thumbnail-extraction-timing-policy]]
