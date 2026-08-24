---
layer: business-logic
tags: [subtitle, policy]
created: 2026-01-08
links:
  - "[[support-cases/synthetic-video-streaming/case-1984]]"
---

# นโยบายการซิงก์ Subtitle

subtitle ที่ publisher อัปโหลดมาต้องอ้างอิง timestamp กับต้นฉบับเดิมเสมอ ไม่ใช่กับ rendition ใดๆ ที่ transcode ออกมา เพราะ framerate ของแต่ละ rendition อาจถูกปรับให้ต่างจากต้นฉบับได้ในบางกรณี

ถ้า transcode-worker re-encode ไฟล์ที่มี framerate เปลี่ยนไปจากต้นฉบับ (เช่นปรับ 29.97fps เป็น 30fps เพื่อความเข้ากันได้) ระบบต้องคำนวณ offset ของ subtitle timestamp ใหม่ตามอัตราส่วน framerate ที่เปลี่ยน ไม่ใช้ timestamp เดิมตรงๆ — บทเรียนจาก [[support-cases/synthetic-video-streaming/case-1984]]
