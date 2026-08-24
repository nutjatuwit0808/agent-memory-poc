---
layer: business-logic
tags: [ladder, encoding, policy]
created: 2026-02-18
links:
  - "[[structure/synthetic-video-streaming/module-bitrate-ladder-selector]]"
  - "[[business-logic/synthetic-video-streaming/bitrate-ladder-selection-policy-edge-cases]]"
---

# นโยบายการเลือก Bitrate Ladder

[[structure/synthetic-video-streaming/module-bitrate-ladder-selector]] คำนวณ ladder จาก resolution และ bitrate ของต้นฉบับเสมอ ห้าม transcode rendition ที่ resolution หรือ bitrate สูงกว่าต้นฉบับเด็ดขาด (ไม่ upscale) เพราะเปลืองพื้นที่จัดเก็บและ compute โดยไม่เพิ่มคุณภาพจริง

จำนวน rung มาตรฐานคือ 5 ระดับ (1080p, 720p, 480p, 360p, 240p) แต่ถ้าต้นฉบับมี resolution ต่ำกว่า 1080p ระบบจะตัด rung ที่สูงกว่าต้นฉบับออกจาก ladder ทั้งหมด ไม่ใส่ rung ปลอมที่ resolution เท่าต้นฉบับซ้ำ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-video-streaming/bitrate-ladder-selection-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
