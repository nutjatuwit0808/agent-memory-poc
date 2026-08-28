---
layer: business-logic
tags: [invalidation, emergency, edge-case]
created: 2026-01-14
links:
  - "[[business-logic/synthetic-content-delivery/invalidation-propagation-policy]]"
---

# ข้อยกเว้น: Invalidation ฉุกเฉิน (Emergency Purge)

สำหรับกรณีฉุกเฉินที่ content ต้องถูกถอดออกทันที เช่น เนื้อหาที่ละเมิดกฎหมายหรือ content ที่ถูก DMCA takedown แจ้ง — tenant สามารถ flag invalidation เป็น `priority: emergency` ซึ่งจะ bypass queue ปกติและส่งตรงไปยัง edge node ทุกจุดพร้อมกันทันที ไม่รอ batch

Emergency invalidation ไม่มี `PROPAGATION_TIMEOUT_SECONDS` เหมือน invalidation ปกติ — จะ retry จนสำเร็จหรือจนกว่า edge node นั้นจะถูก drain ออกจาก pool ชั่วคราว ข้อมูลจะถูก log ทุกขั้นตอนเพื่อรองรับการตรวจสอบทางกฎหมายในภายหลัง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-content-delivery/invalidation-propagation-policy]] ("นโยบาย Propagation Timeout ของ Cache Invalidation") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
