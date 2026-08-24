---
layer: business-logic
tags: [provisioning, firmware, policy]
created: 2025-12-10
---

# นโยบายการ Rollout Firmware อุปกรณ์ GPS

firmware ใหม่ต้อง rollout แบบ staged เสมอ เริ่มจากอุปกรณ์ไม่เกิน 50 ตัวในกลุ่มลูกค้าที่สมัครใจทดสอบก่อน สังเกตอาการอย่างน้อย 48 ชั่วโมงก่อนขยายไปทั้งฟลีท

ห้าม rollout firmware ระหว่างช่วง rush window โดยเด็ดขาด เพราะอุปกรณ์ที่กำลังอัปเดตจะไม่ส่ง ping ชั่วคราว ถ้าเกิดตอนช่วงที่มีรถวิ่งพร้อมกันเยอะจะกระทบ dashboard ลูกค้าจำนวนมากพร้อมกัน
