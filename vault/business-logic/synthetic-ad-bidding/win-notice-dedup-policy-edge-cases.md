---
layer: business-logic
tags: [billing, dedup, edge-case]
created: 2025-11-21
links:
  - "[[support-cases/synthetic-ad-bidding/case-5244]]"
  - "[[business-logic/synthetic-ad-bidding/win-notice-dedup-policy]]"
---

# กรณี noticeId ชนกันข้าม SSP คนละราย

SSP บางรายไม่ได้รับประกันว่า noticeId จะ unique ในระดับ global — เคยพบ noticeId ชนกันระหว่าง SSP สองรายที่ไม่เกี่ยวข้องกัน ระบบจึงต้อง compose dedup key จาก `(sspId, noticeId)` คู่กันเสมอ ไม่ใช่ noticeId เดี่ยวๆ ดู [[support-cases/synthetic-ad-bidding/case-5244]] สำหรับเหตุการณ์จริงที่เกิดจากการมองข้ามจุดนี้

ถ้าตรวจพบ noticeId ชนกันข้าม SSP หลังจากที่ dedup key ถูกแก้ไขแล้ว (เช่น SSP รายใหม่ที่เพิ่งต่อระบบ) ให้ถือว่าเป็นเหตุการณ์ผิดปกติที่ต้องแจ้งทีม partnerships ไปคุยกับ SSP รายนั้นโดยตรง ไม่ใช่แก้ที่ dedup logic อีก

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-ad-bidding/win-notice-dedup-policy]] ("นโยบายกัน Win Notice ซ้ำ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
