---
layer: structure
tags: [ladder, module]
created: 2026-01-21
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[structure/synthetic-video-streaming/module-playlist-generator]]"
  - "[[business-logic/synthetic-video-streaming/bitrate-ladder-selection-policy]]"
---

# Module: bitrate-ladder-selector

คำนวณว่าวิดีโอต้นฉบับหนึ่งไฟล์ควร transcode เป็นกี่ rendition และแต่ละ rendition ควรมี resolution/bitrate เท่าไหร่ (bitrate ladder) โดยอิงจาก resolution และ bitrate ของต้นฉบับเอง ไม่ transcode ขึ้นความละเอียดเกินต้นฉบับเด็ดขาด

## ฟังก์ชันหลัก
- `computeLadder(sourceProbe: MediaProbe): BitrateLadder` — คำนวณ ladder เต็มชุดจาก metadata ต้นฉบับ
- `selectRenditionsForDevice(deviceClass: DeviceClass, ladder: BitrateLadder): Rendition[]` — กรอง rendition ที่อุปกรณ์กลุ่มนั้นรองรับจริง เช่นตัด HEVC ออกถ้าอุปกรณ์ไม่รองรับ
- `validateLadderMonotonic(ladder: BitrateLadder): boolean` — ตรวจว่าแต่ละ rung มี bitrate สูงขึ้นตาม resolution เสมอ ไม่มี rung ที่ resolution สูงกว่าแต่ bitrate ต่ำกว่า

## ความสัมพันธ์กับ module อื่น

ผลลัพธ์จาก `computeLadder` ถูกส่งให้ [[structure/synthetic-video-streaming/module-transcode-worker]] เป็น encode profile และถูก [[structure/synthetic-video-streaming/module-playlist-generator]] ใช้กำหนดลำดับ rung ใน manifest พร้อมกัน ดู [[business-logic/synthetic-video-streaming/bitrate-ladder-selection-policy]]
