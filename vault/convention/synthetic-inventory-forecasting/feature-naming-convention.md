---
layer: convention
tags: [feature-store, naming]
created: 2026-03-21
links:
  - "[[structure/synthetic-inventory-forecasting/module-feature-store]]"
  - "[[support-cases/synthetic-inventory-forecasting/case-2962]]"
---

# Feature Naming Convention

feature ทุกตัวใน [[structure/synthetic-inventory-forecasting/module-feature-store]] ต้องตั้งชื่อตามกติกานี้ เพื่อให้ทุกทีมที่ query feature vector เข้าใจความหมายตรงกันโดยไม่ต้องเปิดเอกสารแยก

## รูปแบบชื่อ

`camelCase` เสมอ ระบุหน่วยเวลาต่อท้ายถ้าเป็น rolling window เช่น `rollingAvg28d`, `rollingAvg7d` — ห้ามใช้ตัวย่อที่กำกวม เช่น `avg` เฉยๆ โดยไม่ระบุ window

## เมื่อเปลี่ยนชื่อ field

ห้ามเปลี่ยนชื่อ field เดิมโดยตรงเด็ดขาด ต้องเพิ่ม field ใหม่คู่ขนานแล้ว deprecate field เก่าอย่างมีกำหนดเวลาชัดเจนแทน — บทเรียนตรงจาก [[support-cases/synthetic-inventory-forecasting/case-2962]] ที่ rename field แล้ว consumer เก่าอ่านค่า default เงียบๆ
