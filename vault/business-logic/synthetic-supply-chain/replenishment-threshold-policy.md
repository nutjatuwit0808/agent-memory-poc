---
layer: business-logic
tags: [replenishment, threshold, policy]
created: 2025-09-29
links:
  - "[[structure/synthetic-supply-chain/module-replenishment-trigger]]"
---

# นโยบายเกณฑ์การ Trigger Replenishment

Reorder point คำนวณจาก average daily usage × (lead time + safety buffer days) โดย safety buffer ปรับตาม variability ของ supplier delivery — ซัพพลายเออร์ที่ส่งสายบ่อยจะมี buffer สูงกว่า การตั้ง reorder point ต้องทบทวนทุกไตรมาสหรือเมื่อ usage pattern เปลี่ยนอย่างมีนัยสำคัญ

PO ที่สร้างโดย [[structure/synthetic-supply-chain/module-replenishment-trigger]] ที่มูลค่าเกิน `MAX_AUTO_PO_VALUE_THB` จะถูก route ให้ procurement team อนุมัติก่อนส่งซัพพลายเออร์ เพื่อป้องกันการสั่งซื้อจำนวนมากโดยอัตโนมัติในกรณีที่ config มีปัญหา
