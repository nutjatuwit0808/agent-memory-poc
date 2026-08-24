---
layer: structure
tags: [playlist, module, core, reference, identifiers]
created: 2026-05-08
links:
  - "[[structure/synthetic-video-streaming/module-playlist-generator]]"
  - "[[business-logic/synthetic-video-streaming/origin-shield-cache-policy]]"
---

# playlist-generator — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด playlist-generator สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-video-streaming/module-playlist-generator]])

## Public functions
- `generateMasterPlaylist(assetId: string): Promise<string>` — สร้าง master playlist ที่ลิสต์ทุก rendition พร้อม bandwidth attribute
- `generateMediaPlaylist(assetId: string, renditionId: string): Promise<string>` — สร้าง media playlist ของ rendition เดียว ลิสต์ segment ทั้งหมด
- `appendSegment(assetId: string, renditionId: string, segment: SegmentRef): Promise<void>` — เพิ่ม segment ใหม่เข้า live playlist window แล้วเลื่อน window ตาม `MAX_LIVE_WINDOW_SEGMENTS`
- `invalidatePlaylist(assetId: string): Promise<void>` — บังคับสร้าง manifest ใหม่ทั้งชุด ใช้เมื่อ ladder เปลี่ยนหรือ rendition ถูกลบ

## Internal constants
- `PLAYLIST_TARGET_DURATION_SEC = 6`
- `MAX_LIVE_WINDOW_SEGMENTS = 15`

## Type

```ts
interface MediaPlaylistEntry {
  segmentUrl: string;
  durationSec: number;
  sequenceNumber: number;
  discontinuity?: boolean;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง cache ของ manifest ที่ [[business-logic/synthetic-video-streaming/origin-shield-cache-policy]]
