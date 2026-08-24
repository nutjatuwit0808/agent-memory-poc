---
layer: business-logic
tags: [occupancy, firmware, policy]
created: 2026-05-10
---

# นโยบายการอัปเดต Firmware ของ Occupancy Sensor

firmware ใหม่ของ occupancy sensor ต้อง rollout แบบ staged เสมอ เริ่มจาก sensor ไม่เกิน 10 ตัวในชั้นเดียวก่อน สังเกตอาการอย่างน้อย 48 ชั่วโมงก่อนขยายไปทั้งอาคาร

ห้าม rollout firmware ระหว่าง warm-up window (07:00-09:30) โดยเด็ดขาด เพราะเป็นช่วงที่ระบบพึ่งพาข้อมูล occupancy หนาแน่นที่สุดในการปรับ comfort band ให้ทันก่อนคนเข้าออฟฟิศ
