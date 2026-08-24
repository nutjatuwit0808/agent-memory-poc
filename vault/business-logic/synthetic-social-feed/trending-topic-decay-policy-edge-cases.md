---
layer: business-logic
tags: [trending, edge-case]
created: 2026-05-12
links:
  - "[[business-logic/synthetic-social-feed/duplicate-post-detection-policy]]"
  - "[[business-logic/synthetic-social-feed/trending-topic-decay-policy]]"
---

# ข้อยกเว้นสำหรับหัวข้อเหตุการณ์ด่วน (Breaking News)

หัวข้อที่ถูก flag ว่าเป็น breaking news (จากแหล่งข่าวที่ยืนยันแล้ว) จะใช้อัตรา decay ที่ช้ากว่าปกติ 3 เท่า เพราะเหตุการณ์สำคัญมักมีช่วงเงียบสั้นๆ ระหว่างที่รอข้อมูลเพิ่มเติมก่อนจะกลับมาถูกพูดถึงอีกครั้ง ไม่ควรถูกถอดออกเร็วเกินไป

หัวข้อที่สงสัยว่าถูกปั่นด้วย bot network (ดู [[business-logic/synthetic-social-feed/duplicate-post-detection-policy]]) จะถูก suppress ทันทีไม่ว่าคะแนน decay จะเป็นเท่าไหร่ ไม่รอให้ decay ตามธรรมชาติเพราะเป็นการบิดเบือนที่ตั้งใจ ไม่ใช่ความสนใจจริงของผู้ใช้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-social-feed/trending-topic-decay-policy]] ("นโยบายการลดคะแนน Trending ตามเวลา") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
