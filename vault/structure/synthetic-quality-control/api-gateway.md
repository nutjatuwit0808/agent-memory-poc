---
layer: structure
tags: [quality-control, qualitypulse, gateway, api]
created: 2026-03-12
links:
  - "[[structure/synthetic-quality-control/module-batch-inspector]]"
  - "[[structure/synthetic-quality-control/module-certification-generator]]"
---

# API Gateway

คำสั่งจาก MES (Manufacturing Execution System) ภายนอกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลง production run เป็น inspection request แล้วส่งต่อให้ [[structure/synthetic-quality-control/module-batch-inspector]] คำขอที่ต้องการสถานะปัจจุบันของ batch ใช้ synchronous call ผ่าน gateway ตัวนี้

คำสั่งออกใบรับรองฉุกเฉิน (expedited certification) ไม่ผ่าน gateway เดียวกัน — ใช้ channel แยกที่ [[structure/synthetic-quality-control/module-certification-generator]] ควบคุมโดยตรง เพราะ latency ของ gateway กลางสูงเกินไปสำหรับสถานการณ์ที่ฝ่ายขายกด ship ทันที
