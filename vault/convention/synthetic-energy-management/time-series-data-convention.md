---
layer: convention
tags: [data, meter]
created: 2025-12-04
links:
  - "[[support-cases/synthetic-energy-management/case-1695]]"
---

# Time-series Data Convention

เอกสารนี้กำหนดวิธีจัดการข้อมูล time-series จาก meter ให้สอดคล้องกันทั้งระบบ เพราะเป็นข้อมูลปริมาณมากที่สุดในระบบ

## การเก็บ timestamp

timestamp ทุกจุดข้อมูลต้องเป็น UTC เสมอ ไม่เก็บ local time — การแปลงเป็น local time ทำที่ layer การแสดงผลเท่านั้น เพื่อป้องกันปัญหาแบบที่เคยเกิดกับ [[support-cases/synthetic-energy-management/case-1695]]

## การจัดการข้อมูลขาดหาย

ห้าม interpolate ค่าที่ขาดหายแล้วเก็บเป็นข้อมูลจริงปนกับข้อมูลที่วัดได้จริง ต้อง flag แยกชัดเจนว่าเป็นค่าประมาณการเสมอในทุก query ที่ดึงข้อมูลออกไปใช้งาน
