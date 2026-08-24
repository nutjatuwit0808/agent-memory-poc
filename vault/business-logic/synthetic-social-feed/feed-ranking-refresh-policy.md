---
layer: business-logic
tags: [ranking, policy]
created: 2026-06-15
links:
  - "[[structure/synthetic-social-feed/module-feed-ranker]]"
  - "[[business-logic/synthetic-social-feed/feed-ranking-refresh-policy-edge-cases]]"
---

# นโยบายการ Refresh คะแนนจัดอันดับ Feed

คะแนนจัดอันดับที่ [[structure/synthetic-social-feed/module-feed-ranker]] คำนวณไว้จะถูก cache ไว้สูงสุด `FEED_SCORE_CACHE_TTL_HOURS` ชั่วโมง หลังจากนั้นถือว่า stale และต้องคำนวณใหม่ก่อนแสดงให้ผู้ใช้

เมื่อมี engagement ใหม่เข้ามา (like/comment/share) คะแนนจะถูก invalidate และคำนวณใหม่แบบ incremental ทันที ไม่ต้องรอครบ TTL เสมอไป

## ทำไมต้อง cache แทนคำนวณสด

การคำนวณคะแนนจัดอันดับทุกครั้งที่ผู้ใช้เปิดแอปมีต้นทุน compute สูงมากเพราะต้องพิจารณาผู้สมัครหลายร้อยโพสต์พร้อมกัน — cache ไว้ระยะสั้นแล้ว invalidate เฉพาะจุดที่เปลี่ยนจริงคุ้มกว่าคำนวณสดทุกครั้งมาก

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-social-feed/feed-ranking-refresh-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
