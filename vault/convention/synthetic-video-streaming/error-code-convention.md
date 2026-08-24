---
layer: convention
tags: [error, api]
created: 2026-05-10
links:
  - "[[convention/synthetic-video-streaming/api-response-format]]"
---

# Error Code Convention

## รูปแบบ

`SF_<DOMAIN>_<REASON>` เช่น `SF_TRANSCODE_SOURCE_CORRUPT`, `SF_DRM_CONCURRENT_LIMIT` ตัวพิมพ์ใหญ่ทั้งหมด

## หมวดที่ใช้บ่อย

`SF_STORAGE_QUOTA_EXCEEDED`, `SF_LADDER_CODEC_UNSUPPORTED`, `SF_CDN_ORIGIN_TIMEOUT` — ดูรายชื่อเต็มที่ [[convention/synthetic-video-streaming/api-response-format]]
