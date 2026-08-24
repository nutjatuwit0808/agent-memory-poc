---
layer: structure
tags: [transcode, module, core]
created: 2026-03-19
links:
  - "[[business-logic/synthetic-video-streaming/transcode-retry-policy]]"
  - "[[structure/synthetic-video-streaming/module-drm-license-server]]"
  - "[[structure/synthetic-video-streaming/module-cdn-origin-shield]]"
---

# Module: transcode-worker

รับผิดชอบแปลงไฟล์วิดีโอต้นฉบับ (หรือ segment สดจาก live ingest) เป็นหลาย rendition ตาม bitrate ladder ที่กำหนด เป็น service ที่กิน compute หนักที่สุดในระบบ แยก worker pool ออกจาก service อื่นทั้งหมดเพื่อ scale อิสระตามคิวงานโดยไม่กระทบ latency ของฝั่ง playback

## ฟังก์ชันหลัก
- `transcodeSegment(jobId: string, sourceUrl: string, profile: EncodeProfile): Promise<TranscodeResult>` — สั่ง transcode 1 segment/rendition คืนผลว่าสำเร็จหรือพลาดพร้อมเหตุผล
- `probeSource(sourceUrl: string): Promise<MediaProbe>` — อ่าน metadata ต้นฉบับ (resolution, bitrate, codec, framerate) ก่อนเริ่ม transcode จริง
- `reportProgress(jobId: string, pct: number): Promise<void>` — รายงานความคืบหน้ากลับเข้า `transcode_jobs` ทุก segment ที่เสร็จ
- `cancelJob(jobId: string, reason: string): Promise<void>` — ยกเลิกงานที่กำลังทำอยู่ เช่นเมื่อ publisher ลบ asset ระหว่าง transcode

## State

queued → probing → transcoding → muxing → completed | failed — ดู [[business-logic/synthetic-video-streaming/transcode-retry-policy]] สำหรับเงื่อนไขว่าเมื่อไหร่ retry เมื่อไหร่ escalate

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-video-streaming/module-drm-license-server]] โดยตรง — rendition ที่ต้องเข้ารหัส DRM จะถูก mux แบบไม่เข้ารหัสก่อน แล้วให้ [[structure/synthetic-video-streaming/module-cdn-origin-shield]] เรียก drm-license-server แยกตอน serve จริง เพื่อไม่ให้ transcode-worker ต้องรู้จัก license policy เลย
