---
layer: structure
tags: [playlist, module, core]
created: 2026-06-17
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[structure/synthetic-video-streaming/module-bitrate-ladder-selector]]"
  - "[[structure/synthetic-video-streaming/service-boundaries]]"
---

# Module: playlist-generator

สร้างและอัปเดต adaptive bitrate manifest (HLS master/media playlist หรือ DASH MPD) จาก rendition ที่ [[structure/synthetic-video-streaming/module-transcode-worker]] ทำเสร็จ เป็น service เดียวที่รู้จัก "ลำดับ rung" ที่ผู้เล่นจะสลับไปมา ไม่ใช่ transcode-worker หรือ CDN

## ฟังก์ชันหลัก
- `generateMasterPlaylist(assetId: string): Promise<string>` — สร้าง master playlist ที่ลิสต์ทุก rendition พร้อม bandwidth attribute
- `generateMediaPlaylist(assetId: string, renditionId: string): Promise<string>` — สร้าง media playlist ของ rendition เดียว ลิสต์ segment ทั้งหมด
- `appendSegment(assetId: string, renditionId: string, segment: SegmentRef): Promise<void>` — เพิ่ม segment ใหม่เข้า live playlist window แล้วเลื่อน window ตาม `MAX_LIVE_WINDOW_SEGMENTS`
- `invalidatePlaylist(assetId: string): Promise<void>` — บังคับสร้าง manifest ใหม่ทั้งชุด ใช้เมื่อ ladder เปลี่ยนหรือ rendition ถูกลบ

## State

draft (ยังไม่มี rendition พร้อม) → live (กำลังรับ segment ต่อเนื่อง สำหรับ live event) หรือ published (VOD ครบทุก rendition แล้ว) → stale (rendition เปลี่ยนแต่ manifest ยังไม่ regenerate)

## ความสัมพันธ์กับ module อื่น

query ข้าม [[structure/synthetic-video-streaming/module-transcode-worker]] และ [[structure/synthetic-video-streaming/module-bitrate-ladder-selector]] พร้อมกันเป็นข้อยกเว้นที่ตั้งใจ (ดู [[structure/synthetic-video-streaming/service-boundaries]]) — ถ้า manifest ชี้ไปยัง rung ที่ ladder เปลี่ยนไปแล้วแต่ rendition ยังไม่ถูก re-transcode ผู้เล่นจะขอ segment ที่ไม่มีอยู่จริง
