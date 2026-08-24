---
layer: business-logic
tags: [trending, policy]
created: 2025-10-31
links:
  - "[[business-logic/synthetic-social-feed/trending-topic-decay-policy-edge-cases]]"
---

# นโยบายการลดคะแนน Trending ตามเวลา

คะแนน trending ของแต่ละหัวข้อจะลดลงแบบ exponential decay ตามเวลาที่ผ่านไปนับจากจุดที่คะแนนสูงสุด ป้องกันไม่ให้หัวข้อที่เคย trending ค้างอยู่ในรายการนานเกินไปทั้งที่คนไม่พูดถึงแล้ว

หัวข้อที่ engagement ตกลงติดต่อกันเกิน 30 นาที จะถูกถอดออกจากรายการ trending ทันทีแม้คะแนนสะสมจะยังสูงอยู่ก็ตาม

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-social-feed/trending-topic-decay-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
