---
layer: convention
tags: [codec, encoding, naming]
created: 2026-01-05
links:
  - "[[structure/synthetic-video-streaming/module-bitrate-ladder-selector]]"
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[convention/synthetic-video-streaming/testing-convention]]"
---

# Codec Profile Naming Convention

เอกสารนี้กำหนดชื่อ profile ที่ใช้อ้างอิงร่วมกันระหว่าง [[structure/synthetic-video-streaming/module-bitrate-ladder-selector]] และ [[structure/synthetic-video-streaming/module-transcode-worker]] เพื่อไม่ให้สองฝั่งตีความ profile เดียวกันต่างกัน

## รูปแบบชื่อ

`<codec>-<resolution>-<profile-level>` เช่น `h264-720p-main`, `hevc-1080p-main10` ตัวพิมพ์เล็กทั้งหมด คั่นด้วยขีดกลาง

## กติกา

profile ใหม่ที่ยังไม่ผ่านการทดสอบ compatibility กับอุปกรณ์กลุ่มหลักห้ามตั้งเป็น default ของ ladder จนกว่าจะผ่าน [[convention/synthetic-video-streaming/testing-convention]] ครบ
