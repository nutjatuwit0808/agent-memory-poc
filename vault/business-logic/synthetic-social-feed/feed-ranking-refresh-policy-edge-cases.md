---
layer: business-logic
tags: [ranking, edge-case]
created: 2026-04-03
links:
  - "[[business-logic/synthetic-social-feed/feed-ranking-refresh-policy]]"
---

# ข้อยกเว้นของนโยบาย Refresh คะแนน

ถ้าโพสต์ถูก moderation ถอดออก (`post.removed`) คะแนนของโพสต์นั้นถูก invalidate ทันทีในทุกผู้ใช้ที่เคย cache ไว้ ไม่รอ TTL หมดอายุตามปกติ เพราะการแสดงโพสต์ที่ถูกลบไปแล้วเป็นปัญหาที่ยอมรับไม่ได้

ผู้ใช้ที่เพิ่งสมัครใหม่ (ยังไม่มี engagement history) จะได้คะแนนจากโมเดล cold-start แยกต่างหากที่ให้น้ำหนัก trending topic มากกว่าปกติ แทนที่จะใช้สูตรเดียวกับผู้ใช้ทั่วไปที่ engagement history ไม่พอให้โมเดลหลักทำงานได้ดี

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-social-feed/feed-ranking-refresh-policy]] ("นโยบายการ Refresh คะแนนจัดอันดับ Feed") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
