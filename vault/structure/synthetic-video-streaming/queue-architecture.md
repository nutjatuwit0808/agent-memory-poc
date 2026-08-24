---
layer: structure
tags: [video-streaming, streamforge, queue, async]
created: 2026-03-14
links:
  - "[[structure/synthetic-video-streaming/module-playlist-generator]]"
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[structure/synthetic-video-streaming/module-cdn-origin-shield]]"
  - "[[business-logic/synthetic-video-streaming/content-takedown-policy]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `transcode.job.completed`, `transcode.job.failed`, `asset.uploaded`, `license.issued`, `cache.purge.requested` — [[structure/synthetic-video-streaming/module-playlist-generator]] subscribe `transcode.job.completed` เพื่ออัปเดต manifest ทันทีที่มี rendition ใหม่พร้อมเสิร์ฟ โดยไม่ต้อง poll [[structure/synthetic-video-streaming/module-transcode-worker]] เอง

[[structure/synthetic-video-streaming/module-cdn-origin-shield]] subscribe `cache.purge.requested` เพื่อล้าง cache เมื่อมีการอัปเดตคอนเทนต์หรือถูกสั่งถอดออก (takedown) — แยก event นี้ออกจาก `transcode.job.completed` เพราะการ purge cache ต้องเกิดแม้ transcode ไม่เกี่ยวข้องเลย เช่นกรณี takedown ตาม [[business-logic/synthetic-video-streaming/content-takedown-policy]]
