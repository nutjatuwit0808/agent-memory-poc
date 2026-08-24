---
layer: business-logic
tags: [forecasting, category, policy]
created: 2025-09-24
links:
  - "[[business-logic/synthetic-inventory-forecasting/cold-start-fallback-policy]]"
---

# นโยบายการใช้ค่าเฉลี่ย Category ทดแทน

SKU ที่มีข้อมูลยอดขายไม่พอ (น้อยกว่า 4 สัปดาห์ในรอบ 12 สัปดาห์ล่าสุด แต่ไม่ใช่สินค้าใหม่เอี่ยม) ใช้ค่าเฉลี่ย category ผสมกับสัญญาณ SKU ที่มีอยู่บางส่วน ต่างจาก [[business-logic/synthetic-inventory-forecasting/cold-start-fallback-policy]] ซึ่งใช้กับ SKU ที่ไม่มีประวัติเลย

สัดส่วนผสมคำนวณจากจำนวนสัปดาห์ที่มีข้อมูลจริงเทียบกับ 4 สัปดาห์ขั้นต่ำ ไม่ใช่สูตรเดียวกับ cold-start เพราะ SKU กลุ่มนี้มีสัญญาณบางส่วนที่น่าเชื่อถือกว่าสินค้าใหม่ล้วนๆ
