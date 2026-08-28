---
layer: business-logic
tags: [moq, emergency, edge-case]
created: 2025-11-27
links:
  - "[[business-logic/synthetic-supply-chain/expedite-surcharge-policy]]"
  - "[[structure/synthetic-supply-chain/module-replenishment-trigger]]"
  - "[[business-logic/synthetic-supply-chain/minimum-order-quantity-policy]]"
---

# ข้อยกเว้น MOQ สำหรับ Emergency Order

กรณี production line หยุดเพราะขาดวัตถุดิบเร่งด่วน ทีม procurement สามารถสร้าง PO ต่ำกว่า MOQ ได้โดยต้องระบุ `orderType: "emergency"` และมีผู้อนุมัติระดับ manager ขึ้นไปเป็นลายลักษณ์อักษร ซัพพลายเออร์มักจะยอมรับ emergency order ต่ำกว่า MOQ แต่อาจบวก expedite surcharge ตาม [[business-logic/synthetic-supply-chain/expedite-surcharge-policy]]

Emergency order ต้องถูก flag ในระบบและรายงานไปยัง management ทุกเดือน เพราะ pattern ของ emergency order ซ้ำๆ สำหรับ SKU เดิมบ่งชี้ว่า reorder point ถูกตั้งต่ำเกินไป และควรทบทวน config ของ [[structure/synthetic-supply-chain/module-replenishment-trigger]]

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-supply-chain/minimum-order-quantity-policy]] ("นโยบาย Minimum Order Quantity (MOQ)") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
