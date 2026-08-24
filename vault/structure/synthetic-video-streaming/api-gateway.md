---
layer: structure
tags: [video-streaming, streamforge, gateway, api]
created: 2026-03-22
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
---

# API Gateway

คำขออัปโหลดวิดีโอและคำสั่งจัดการ asset จากผู้ผลิตคอนเทนต์เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลงเป็น transcode job แล้วส่งต่อให้ [[structure/synthetic-video-streaming/module-transcode-worker]] คำขอเช็คสถานะ job หรือดึง URL playlist ใช้ synchronous call ผ่าน gateway ตัวนี้เหมือนกัน

segment ของ live event ไม่ผ่าน API gateway กลาง — ingest ผ่าน low-latency channel แยกต่างหาก (RTMP/SRT) ที่ [[structure/synthetic-video-streaming/module-transcode-worker]] รับตรง เพราะ segment ของ live ส่งเข้ามาทุก 2 วินาทีต่อเนื่อง latency ของ gateway กลาง (เฉลี่ย 80-150ms ต่อ request) จะสะสมความหน่วงจนวิดีโอ live ล้าหลังผู้ชมเกินยอมรับได้
