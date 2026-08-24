---
layer: business-logic
tags: [forecasting, cold-start, edge-case]
created: 2025-11-16
links:
  - "[[business-logic/synthetic-inventory-forecasting/cold-start-fallback-policy]]"
---

# ข้อยกเว้นสำหรับ SKU กลยุทธ์ (Strategic Launch)

SKU ที่ถูก flag เป็น `strategic_launch` (สินค้าเรือธงที่มีแผนการตลาดชัดเจนล่วงหน้า) ไม่เข้าเงื่อนไข category-average fallback อัตโนมัติ — ทีม demand planning ต้องกรอกแผนพยากรณ์เริ่มต้นด้วยมือแทน เพราะค่าเฉลี่ย category ทั่วไปมักต่ำกว่าความจริงมากสำหรับสินค้าที่มีการตลาดสนับสนุนหนัก

เมื่อ strategic launch SKU สะสมข้อมูลจริงครบ 4 สัปดาห์ (สั้นกว่า SKU ทั่วไปที่ใช้ 8 สัปดาห์) ระบบจะเริ่ม blend สัญญาณจริงเข้ามาได้เร็วกว่าปกติ เพราะสินค้ากลุ่มนี้มักมีสัญญาณช่วงแรกที่ชัดเจนและน่าเชื่อถือกว่าสินค้าทั่วไป

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-inventory-forecasting/cold-start-fallback-policy]] ("นโยบายพยากรณ์สินค้าใหม่ (Cold Start)") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
