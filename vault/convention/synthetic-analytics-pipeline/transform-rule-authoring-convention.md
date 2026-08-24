---
layer: convention
tags: [transform, authoring]
created: 2025-11-13
links:
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
---

# Transform Rule Authoring Convention

เอกสารนี้กำหนดวิธีเขียนกฎการแปลงข้อมูลให้อ่านง่ายและ debug ง่ายเมื่อเกิดปัญหา สำหรับทุกคนที่เพิ่ม transform rule ผ่าน [[structure/synthetic-analytics-pipeline/module-transform-engine]]

## การจัดการ null

ทุกกฎการแปลงต้องระบุ null fill strategy อย่างชัดเจนต่อ column ห้ามพึ่ง `NULL_FILL_STRATEGY_DEFAULT` เฉยๆ สำหรับ column ที่เป็นตัวเลขทางการเงินหรือมีผลต่อการตัดสินใจทางธุรกิจ ต้องเขียน strategy ระบุตรงๆ ในกฎเสมอ

## การตั้งชื่อกฎ

ชื่อกฎต้องสื่อว่าทำอะไรกับข้อมูล ไม่ใช่แค่ชื่อ column เช่น `normalize-phone-format` ไม่ใช่ `phone-rule-1` เพื่อให้คนอื่นเข้าใจเจตนาโดยไม่ต้องเปิดอ่านโค้ดกฎ
