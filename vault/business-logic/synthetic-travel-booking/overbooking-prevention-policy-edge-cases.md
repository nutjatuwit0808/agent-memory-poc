---
layer: business-logic
tags: [booking, inventory, edge-case]
created: 2025-12-29
links:
  - "[[business-logic/synthetic-travel-booking/loyalty-tier-priority-policy]]"
  - "[[business-logic/synthetic-travel-booking/overbooking-prevention-policy]]"
---

# ข้อยกเว้นเมื่อ Overbooking เกิดขึ้นแล้ว

ถ้าตรวจพบ overbooking หลังยืนยันไปแล้ว (เช่น ซัพพลายเออร์แจ้งย้อนหลังว่าห้องเต็มจริง) ระบบจะไม่ยกเลิกการจองของลูกค้าฝ่ายที่จองทีหลังโดยอัตโนมัติ — ต้องให้ทีม support ติดต่อลูกค้าเสนอที่พักทดแทนระดับเทียบเท่าหรือดีกว่าก่อนเสมอ ไม่ปล่อยให้ลูกค้าได้รับแค่อีเมลยกเลิกเฉยๆ

ลูกค้าที่ได้รับผลกระทบจาก overbooking ได้สิทธิ์ชดเชยอัตโนมัติตาม tier บัญชี (ดู [[business-logic/synthetic-travel-booking/loyalty-tier-priority-policy]]) โดยไม่ต้องร้องขอเอง เพราะทีมมองว่าเป็นความผิดพลาดฝั่งระบบ ไม่ใช่ฝั่งลูกค้า

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-travel-booking/overbooking-prevention-policy]] ("นโยบายป้องกัน Overbooking") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
