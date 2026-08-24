---
layer: structure
tags: [inventory-forecasting, forecastiq, gateway, api]
created: 2026-05-16
links:
  - "[[structure/synthetic-inventory-forecasting/module-demand-model-runner]]"
---

# API Gateway

คำขอจาก ERP ภายนอกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลงคำขอ "ขอดูพยากรณ์ SKU นี้" เป็น query ไปยัง [[structure/synthetic-inventory-forecasting/module-demand-model-runner]] คำขอที่ต้องการผลลัพธ์ทันที เช่น เช็คสถานะ batch run ล่าสุด ใช้ synchronous call ตรงนี้

การรัน batch พยากรณ์จริงไม่ผ่าน API gateway ตัวนี้ — เป็น scheduled job ภายในที่ trigger เองตามเวลา เพราะเป็น workload ขนาดใหญ่ (หลายล้าน SKU x store combination ต่อคืน) ที่ไม่เหมาะกับ synchronous request-response pattern เลย
