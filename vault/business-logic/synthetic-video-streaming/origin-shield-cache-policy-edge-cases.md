---
layer: business-logic
tags: [cdn, cache, edge-case]
created: 2025-10-28
links:
  - "[[support-cases/synthetic-video-streaming/case-6823]]"
  - "[[business-logic/synthetic-video-streaming/origin-shield-cache-policy]]"
---

# ข้อยกเว้นเมื่อคอนเทนต์ได้รับความนิยมพุ่งขึ้นกะทันหัน

เมื่อ request rate ต่อ segment เดียวกันพุ่งเกิน threshold ในเวลาสั้น ระบบจะ coalesce request ที่ซ้ำกันให้รอ response เดียวจาก origin แทนที่จะปล่อยให้ทุก request ยิงไป origin พร้อมกัน (request coalescing ด้วย lock ตาม `ORIGIN_SHIELD_STAMPEDE_LOCK_MS`) — บทเรียนจาก [[support-cases/synthetic-video-streaming/case-6823]]

วิดีโอที่ถูกตรวจพบว่ากำลังไวรัล (จัดกลุ่ม trending อัตโนมัติ) จะถูก `primeCache` ล่วงหน้าไปยัง edge node ทุกภูมิภาคทันทีที่ตรวจพบ แทนที่จะรอให้ cache miss ธรรมชาติค่อยๆ กระจาย เพื่อลดภาระ origin ในช่วงพีคของความนิยม

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-video-streaming/origin-shield-cache-policy]] ("นโยบาย Cache ของ Origin Shield") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
