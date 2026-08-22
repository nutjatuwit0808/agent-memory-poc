---
layer: business-logic
tags: [customer, tier, loyalty]
created: 2026-04-15
links:
  - "[[business-logic/loyalty-points-calculation]]"
  - "[[business-logic/promo-code-rules]]"
---

# สิทธิประโยชน์ตามระดับสมาชิก (Customer Tier)

## ระดับและเกณฑ์

| Tier | เกณฑ์ (ยอดซื้อสะสม 12 เดือน) |
|---|---|
| Bronze | เริ่มต้นทุกบัญชี |
| Silver | ≥ 10,000 บาท |
| Gold | ≥ 50,000 บาท |
| Platinum | ≥ 200,000 บาท |

Tier คำนวณใหม่ทุกวันที่ 1 ของเดือน จากยอดซื้อย้อนหลัง 12 เดือนนับถึงวันคำนวณ — tier ลดระดับได้ถ้ายอดซื้อไม่ถึงเกณฑ์ต่อเนื่อง ไม่ใช่ตำแหน่งถาวร

## สิทธิประโยชน์

- คะแนนสะสมคูณตาม multiplier ที่ [[business-logic/loyalty-points-calculation]]
- ส่งฟรีไม่มีขั้นต่ำสำหรับ Gold ขึ้นไป
- โค้ดส่วนลดพิเศษเฉพาะ tier ตาม [[business-logic/promo-code-rules]]
- Platinum มีช่องทาง support แยกที่ตอบเร็วกว่า (priority queue)

## ผลของการคืนเงินต่อ tier

ยอดที่ถูกคืนเงินจะไม่ถูกนับเป็นยอดซื้อสะสมสำหรับคำนวณ tier — ถ้าลูกค้าซื้อของมูลค่าสูงแล้วคืนเงินทั้งหมด จะไม่ได้ tier จากยอดนั้น แม้ระบบจะเคยนับไปแล้วชั่วคราวระหว่างที่ order ยังไม่ถูกคืนเงิน
