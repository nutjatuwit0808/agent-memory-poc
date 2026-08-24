---
layer: business-logic
tags: [pricing, currency, edge-case]
created: 2026-08-10
links:
  - "[[business-logic/synthetic-travel-booking/currency-conversion-policy]]"
---

# ข้อยกเว้นสำหรับสกุลเงินที่ FX rate ผันผวนสูง

สกุลเงินที่ถูกจัดกลุ่ม `high_volatility` (เช่นบางสกุลเงินตลาดเกิดใหม่) ใช้ FX rate อายุไม่เกิน 15 นาทีแทนที่จะเป็น 1 ชั่วโมงตามปกติ เพราะความผันผวนสูงทำให้ rate เก่าคลาดเคลื่อนจนกระทบราคาสุดท้ายอย่างมีนัยสำคัญ

ถ้าดึง FX rate สดไม่สำเร็จสำหรับสกุลเงินกลุ่มนี้ ระบบจะปฏิเสธการแสดงราคาในสกุลเงินนั้นชั่วคราวและเสนอสกุลเงินอ้างอิง (USD) แทน ดีกว่าแสดงราคาที่อาจผิดจากอัตราจริงมาก

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-travel-booking/currency-conversion-policy]] ("นโยบายการแปลงสกุลเงิน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
