---
layer: business-logic
tags: [knowledge-base, edge-case]
created: 2025-09-28
links:
  - "[[support-cases/synthetic-chat-support-bot/case-4172]]"
  - "[[business-logic/synthetic-chat-support-bot/knowledge-base-sync-policy]]"
---

# ข้อยกเว้นเมื่อมีการเปลี่ยนแปลงนโยบายด่วน

เมื่อทีมเนื้อหาทำเครื่องหมายบทความว่าเป็น `urgent_update` (เช่นเปลี่ยนนโยบายที่กระทบลูกค้าจำนวนมากทันที) ระบบจะ sync บทความนั้นทันทีนอกรอบปกติแทนการรอ 60 นาที เพื่อไม่ให้ bot ตอบด้วยข้อมูลที่ล้าสมัยไปแล้วในช่วงเปลี่ยนผ่าน — บทเรียนจาก [[support-cases/synthetic-chat-support-bot/case-4172]]

ระหว่างที่ sync แบบด่วนกำลังทำงาน ระบบจะ pause การใช้บทความเวอร์ชันเก่าของหัวข้อนั้นชั่วคราว (ตอบว่ากำลังตรวจสอบข้อมูลแทนการเดา) ดีกว่าปล่อยให้ตอบด้วยข้อมูลที่รู้อยู่แล้วว่าผิด

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-chat-support-bot/knowledge-base-sync-policy]] ("นโยบายการ Sync Knowledge Base") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
