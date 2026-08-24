---
layer: structure
tags: [analytics-pipeline, dataflow, gateway, api]
created: 2026-04-13
links:
  - "[[structure/synthetic-analytics-pipeline/module-job-orchestrator]]"
---

# API Gateway

คำสั่งจาก internal dashboard เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปล request เช่น "ดูสถานะ job ล่าสุด" เป็น query ไปยัง [[structure/synthetic-analytics-pipeline/module-job-orchestrator]] คำขอที่ต้องการผลลัพธ์ทันที เช่น trigger job แบบ manual ใช้ synchronous call ตรงนี้

การแจ้งเตือนเมื่อ job ล้มเหลวหรือ data quality check ไม่ผ่าน ไม่ผ่าน API gateway ตัวนี้ — ส่งตรงเข้า Slack channel ของทีมเจ้าของ pipeline ผ่าน webhook แยกต่างหาก เพราะ latency ของ gateway กลาง (เฉลี่ย 100-200ms) ไม่ใช่ปัญหาหลัก แต่ทีมต้องการแยก channel แจ้งเตือนตาม pipeline เจ้าของโดยไม่ต้องผ่าน routing ที่ gateway กลาง
