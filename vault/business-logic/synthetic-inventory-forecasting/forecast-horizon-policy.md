---
layer: business-logic
tags: [forecasting, horizon, policy]
created: 2026-06-10
links:
  - "[[structure/synthetic-inventory-forecasting/module-replenishment-recommender]]"
---

# นโยบายช่วง Horizon ของการพยากรณ์

พยากรณ์มี horizon สูงสุด 12 สัปดาห์ แบ่งเป็นสองช่วงที่ความเชื่อมั่นต่างกัน: short horizon (สัปดาห์ 1-4) มี confidence band แคบเพราะใกล้ปัจจุบัน และ long horizon (สัปดาห์ 5-12) มี confidence band กว้างขึ้นเรื่อยๆ ตามระยะเวลา

[[structure/synthetic-inventory-forecasting/module-replenishment-recommender]] ใช้เฉพาะ short horizon เป็นหลักในการคำนวณจำนวนเติมสินค้ารอบถัดไป ส่วน long horizon ใช้เพื่อวางแผน supplier capacity ล่วงหน้าเท่านั้น ไม่ใช้คำนวณ PO โดยตรง
