---
layer: business-logic
tags: [ladder, edge-case]
created: 2025-10-06
links:
  - "[[support-cases/synthetic-video-streaming/case-5813]]"
  - "[[business-logic/synthetic-video-streaming/bitrate-ladder-selection-policy]]"
---

# ข้อยกเว้นสำหรับต้นฉบับ Bitrate ต่ำผิดปกติ

ถ้าต้นฉบับมี resolution สูง (เช่น 1080p) แต่ bitrate ต่ำผิดปกติ (บีบอัดมาแรงจากต้นทาง) ระบบจะไม่สร้าง rung ที่ bitrate สูงกว่าต้นฉบับแม้ resolution จะรองรับได้ เพราะจะเป็นการเพิ่มขนาดไฟล์โดยไม่เพิ่มคุณภาพจริง (rung นั้นแค่ทำให้ต้นฉบับที่บีบอัดมาแล้วดูแย่ลงจากการ re-encode ซ้ำ)

รายชื่ออุปกรณ์ที่ไม่รองรับ codec บางตัว (เช่น HEVC บนอุปกรณ์เก่า) ต้องมี rung สำรองที่ใช้ H.264 เสมออย่างน้อย 1 rung แม้ ladder หลักจะเป็น HEVC ทั้งหมด — บทเรียนจาก [[support-cases/synthetic-video-streaming/case-5813]]

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-video-streaming/bitrate-ladder-selection-policy]] ("นโยบายการเลือก Bitrate Ladder") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
