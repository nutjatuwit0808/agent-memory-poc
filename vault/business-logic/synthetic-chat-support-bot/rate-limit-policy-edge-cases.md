---
layer: business-logic
tags: [rate-limit, edge-case]
created: 2026-08-04
links:
  - "[[support-cases/synthetic-chat-support-bot/case-7870]]"
  - "[[business-logic/synthetic-chat-support-bot/rate-limit-policy]]"
---

# ข้อยกเว้นสำหรับ Integration ขององค์กรลูกค้าขนาดใหญ่

account ที่ลงทะเบียนเป็น `verified_integration` (ยืนยันแล้วว่าเป็น traffic จาก integration อัตโนมัติของลูกค้าองค์กร ไม่ใช่ spam) จะได้ bucket capacity สูงกว่าปกติ 5 เท่า และมี burst allowance พิเศษสำหรับช่วงที่ traffic พุ่งสั้นๆ เพื่อไม่ให้ integration ที่ถูกต้องถูกบล็อกเหมือนเป็นการโจมตี — บทเรียนจาก [[support-cases/synthetic-chat-support-bot/case-7870]]

การเปลี่ยนสถานะเป็น `verified_integration` ต้องมีคนอนุมัติด้วยมือเสมอ ไม่ให้ระบบเดาจาก pattern การส่งข้อความเอง เพราะ pattern ของการโจมตีกับ integration ที่ถูกต้องบางครั้งดูคล้ายกันมากในช่วงสั้นๆ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-chat-support-bot/rate-limit-policy]] ("นโยบายการจำกัดอัตราข้อความ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
