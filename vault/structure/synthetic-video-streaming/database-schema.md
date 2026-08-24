---
layer: structure
tags: [video-streaming, streamforge, database, schema]
created: 2025-10-09
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[business-logic/synthetic-video-streaming/storage-quota-policy]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-video-streaming/module-transcode-worker]] ดูแล ได้แก่ `transcode_jobs` (สถานะและ progress ของแต่ละงาน) และ `renditions` (rendition ที่ transcode เสร็จแล้วพร้อม path บน object storage)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `transcode_jobs` | transcode-worker | อัปเดต progress ทุก segment ที่เสร็จ |
| `renditions` | transcode-worker | อ้างอิง path บน object storage เท่านั้น ไม่เก็บไฟล์จริง |
| `playlists` | playlist-generator | manifest version ล่าสุดต่อ asset |
| `license_grants` | drm-license-server | ประวัติการออก license ต่อ device/content |
| `storage_usage` | (shared, อัปเดตผ่าน event) | ยอดใช้ storage สะสมต่อ publisher account ดู [[business-logic/synthetic-video-streaming/storage-quota-policy]] |

ทุกตารางใช้ `assetId` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายวันที่เทียบ `renditions` กับไฟล์จริงบน object storage
