---
layer: structure
tags: [video-streaming, streamforge, boundaries]
created: 2025-09-17
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[structure/synthetic-video-streaming/module-drm-license-server]]"
  - "[[structure/synthetic-video-streaming/module-playlist-generator]]"
  - "[[structure/synthetic-video-streaming/module-bitrate-ladder-selector]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-video-streaming/module-transcode-worker]] เป็นเจ้าของสถานะ transcode job ทั้งหมด (progress, rendition ที่เสร็จแล้ว, error) ส่วน [[structure/synthetic-video-streaming/module-drm-license-server]] เป็นเจ้าของ license grant และไม่รู้จัก state ของ transcode job เลย

[[structure/synthetic-video-streaming/module-playlist-generator]] เป็น service เดียวที่ query ข้าม [[structure/synthetic-video-streaming/module-transcode-worker]] (เพื่อรู้ว่า rendition ไหนพร้อมเสิร์ฟแล้ว) และ [[structure/synthetic-video-streaming/module-bitrate-ladder-selector]] (เพื่อรู้ลำดับ rung ที่ถูกต้อง) พร้อมกัน — เหตุผลที่ยอมให้ทำ cross-domain query (ผิดหลักทั่วไป) คือ manifest ที่สร้างออกไปต้องสอดคล้องกับทั้งสถานะ encode จริงและลำดับ ladder ที่ถูกต้องพร้อมกันเสมอ ไม่งั้นผู้เล่นจะได้ manifest ที่ชี้ไปยัง segment ที่ยังไม่มีอยู่จริง
