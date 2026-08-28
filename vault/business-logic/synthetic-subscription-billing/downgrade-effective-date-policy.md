---
layer: business-logic
tags: [plan, policy]
created: 2026-02-14
links:
  - "[[business-logic/synthetic-subscription-billing/downgrade-effective-date-policy-edge-cases]]"
---

# นโยบายวันที่มีผลของการ Downgrade แพลน

การ downgrade แพลนจะมีผลเมื่อสิ้นสุดรอบบิลปัจจุบันเสมอ ไม่มีผลทันที เพื่อให้ลูกค้าใช้สิทธิ์ที่จ่ายเงินไปแล้วเต็มรอบบิลก่อนเปลี่ยนไปแพลนที่มีสิทธิ์น้อยกว่า

ระหว่างที่รอ downgrade มีผล ลูกค้ายังคงใช้ฟีเจอร์ของแพลนเดิมได้เต็มที่ และสามารถยกเลิกคำขอ downgrade ได้ตลอดเวลาก่อนที่จะมีผลจริง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-subscription-billing/downgrade-effective-date-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
