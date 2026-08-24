---
layer: convention
tags: [supplier, integration]
created: 2026-08-14
links:
  - "[[structure/synthetic-travel-booking/module-supplier-sync]]"
  - "[[support-cases/synthetic-travel-booking/case-7491]]"
---

# Supplier Integration Convention

แนวทางมาตรฐานสำหรับการเชื่อมต่อซัพพลายเออร์รายใหม่เข้ากับ [[structure/synthetic-travel-booking/module-supplier-sync]] — เขียนขึ้นหลัง [[support-cases/synthetic-travel-booking/case-7491]] เพื่อป้องกันปัญหาการเปลี่ยน schema แบบไม่แจ้งล่วงหน้าซ้ำอีก

## Schema validation บังคับ

ทุก field ที่ parser อ่านจาก response ของซัพพลายเออร์ต้องผ่าน schema validation ที่ throw error ชัดเจนเมื่อ field คาดหวังหายไป ห้าม default ค่าเป็น 0 หรือ empty string เงียบๆ เด็ดขาด

## Contract test

ซัพพลายเออร์ทุกรายต้องมี contract test แยกที่รันเป็นประจำเทียบ response จริงกับ schema ที่คาดไว้ เพื่อจับความเปลี่ยนแปลงฝั่งซัพพลายเออร์ได้เร็วกว่าที่จะรู้จาก symptom ปลายทาง
