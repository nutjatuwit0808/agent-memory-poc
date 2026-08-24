---
layer: business-logic
tags: [thumbnail, policy]
created: 2026-03-21
links:
  - "[[structure/synthetic-video-streaming/module-thumbnail-extractor]]"
---

# นโยบายจังหวะเวลาการสร้าง Thumbnail

[[structure/synthetic-video-streaming/module-thumbnail-extractor]] เริ่มทำงานก็ต่อเมื่อมี rendition แรกที่คุณภาพสูงสุด (มักเป็น rung บนสุดของ ladder) transcode เสร็จแล้วเท่านั้น ไม่รอให้ทุก rendition เสร็จครบก่อน เพื่อให้ผู้ผลิตเห็น thumbnail ได้เร็วที่สุดโดยไม่ต้องรอ ladder เสร็จทั้งหมด

sprite sheet สำหรับแถบ scrub จะสร้างทีหลังสุดในลำดับความสำคัญ เพราะไม่จำเป็นต่อการเริ่มเล่นวิดีโอ ระบบจึงให้ priority ต่ำกว่า poster image เสมอ
