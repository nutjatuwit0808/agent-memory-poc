---
layer: business-logic
tags: [transcode, retry, edge-case]
created: 2026-03-30
links:
  - "[[business-logic/synthetic-video-streaming/transcode-retry-policy]]"
---

# ข้อยกเว้นของนโยบาย Retry เมื่อสาเหตุมาจากไฟล์ต้นฉบับเสียหาย

ถ้า `probeSource` ตรวจพบว่าไฟล์ต้นฉบับเสียหายตั้งแต่ต้น (reason `source_corrupt`) ระบบจะไม่ retry เลยแม้แต่ครั้งเดียว เพราะการ probe ซ้ำไฟล์เดิมได้ผลเหมือนเดิมทุกครั้งแน่นอน — จะแจ้ง publisher ให้อัปโหลดใหม่ทันที

job ที่ล้มเหลวเพราะ `TRANSCODE_STALL_TIMEOUT_MS` ระหว่าง live event กำลังดำเนินอยู่จะไม่ retry ตาม flow ปกติ เพราะเวลาที่เสียไปกับ retry ทำให้ live เสียจังหวะไปไกลเกินจะไล่ทัน — จะ skip segment นั้นไปเลยแล้วให้ผู้เล่น handle ช่องว่างสั้นๆ แทน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-video-streaming/transcode-retry-policy]] ("นโยบายการ Retry เมื่อ Transcode ล้มเหลว") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
