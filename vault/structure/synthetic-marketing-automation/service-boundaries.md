---
layer: structure
tags: [marketing-automation, wavecast, boundaries]
created: 2025-12-01
links:
  - "[[structure/synthetic-marketing-automation/module-segment-engine]]"
  - "[[structure/synthetic-marketing-automation/module-campaign-builder]]"
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[structure/synthetic-marketing-automation/module-consent-manager]]"
---

# Service Boundaries

[[structure/synthetic-marketing-automation/module-segment-engine]] เป็นเจ้าของ audience segment ทั้งหมด ไม่รู้จัก concept ของ campaign หรือ template เลย — รู้แค่ว่า contact คนไหนอยู่ segment ไหนตามเงื่อนไขล่าสุด [[structure/synthetic-marketing-automation/module-campaign-builder]] เป็นคนดึง segment มาผูกกับ campaign ตอนสร้างเท่านั้น

[[structure/synthetic-marketing-automation/module-send-scheduler]] เป็น service เดียวที่ query ทั้ง [[structure/synthetic-marketing-automation/module-campaign-builder]] และ [[structure/synthetic-marketing-automation/module-consent-manager]] พร้อมกันตอนใกล้เวลาส่งจริง (ข้อยกเว้นที่ตั้งใจ) เพราะต้องเช็คทั้งเนื้อหา campaign และสถานะ consent ล่าสุดของผู้รับแต่ละคน ณ วินาทีที่จะส่งจริง ไม่ใช่ ณ ตอนสร้าง campaign — ถ้าแยก query สองรอบจะเสี่ยงส่งให้คนที่เพิ่ง unsubscribe ไปหมาดๆ
