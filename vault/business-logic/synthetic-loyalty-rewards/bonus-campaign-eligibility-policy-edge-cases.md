---
layer: business-logic
tags: [campaign, tier, edge-case]
created: 2026-08-17
links:
  - "[[business-logic/synthetic-loyalty-rewards/bonus-campaign-eligibility-policy]]"
---

# Campaign Eligibility เมื่อ Tier เพิ่งเปลี่ยนระหว่าง Campaign

สมาชิกที่ upgrade tier ระหว่างช่วง campaign ที่กำลังดำเนินอยู่ จะได้สิทธิ์ campaign ใน tier ใหม่ทันทีสำหรับ transaction ที่ทำหลัง upgrade เพราะ tier ใหม่มีสิทธิ์ดีกว่าหรือเท่ากับ tier เดิม

สมาชิกที่ downgrade tier ระหว่าง campaign ใช้สิทธิ์ tier เดิมตาม grace period จนกว่า grace period จะสิ้นสุดหรือ campaign จบก่อน แล้วแต่อย่างใดจะมาถึงก่อน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-loyalty-rewards/bonus-campaign-eligibility-policy]] ("นโยบายการเข้าร่วม Bonus Campaign") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
