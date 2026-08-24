---
layer: structure
tags: [transcode, module, core, reference, identifiers]
created: 2026-04-07
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[business-logic/synthetic-video-streaming/transcode-retry-policy]]"
---

# transcode-worker — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด transcode-worker สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-video-streaming/module-transcode-worker]])

## Public functions
- `transcodeSegment(jobId: string, sourceUrl: string, profile: EncodeProfile): Promise<TranscodeResult>` — สั่ง transcode 1 segment/rendition คืนผลว่าสำเร็จหรือพลาดพร้อมเหตุผล
- `probeSource(sourceUrl: string): Promise<MediaProbe>` — อ่าน metadata ต้นฉบับ (resolution, bitrate, codec, framerate) ก่อนเริ่ม transcode จริง
- `reportProgress(jobId: string, pct: number): Promise<void>` — รายงานความคืบหน้ากลับเข้า `transcode_jobs` ทุก segment ที่เสร็จ
- `cancelJob(jobId: string, reason: string): Promise<void>` — ยกเลิกงานที่กำลังทำอยู่ เช่นเมื่อ publisher ลบ asset ระหว่าง transcode

## Internal constants
- `MAX_CONCURRENT_SEGMENTS_PER_WORKER = 4`
- `TRANSCODE_STALL_TIMEOUT_MS = 120000`
- `DEFAULT_GOP_SIZE_FRAMES = 48`

## Type

```ts
interface TranscodeResult {
  jobId: string;
  status: "succeeded" | "failed_soft" | "failed_hard";
  failReason?: "source_corrupt" | "codec_unsupported" | "stall_timeout";
  attemptCount: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-video-streaming/transcode-retry-policy]]
