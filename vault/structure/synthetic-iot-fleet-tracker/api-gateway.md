---
layer: structure
tags: [iot-fleet-tracker, trackgrid, gateway, api]
created: 2026-03-10
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]]"
---

# API Gateway

คำสั่งจาก dashboard ลูกค้าเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปล request เช่น "ดูตำแหน่งรถคันนี้ตอนนี้" เป็น query ไปยัง [[structure/synthetic-iot-fleet-tracker/module-gps-ingest]] คำขอที่ต้องการผลลัพธ์ทันที เช่น สถานะอุปกรณ์ปัจจุบัน ใช้ synchronous call ตรงนี้

การแจ้งเตือนแบบเรียลไทม์ เช่น รถออกนอกเส้นทางที่กำหนด ไม่ผ่าน API gateway ตัวนี้ — [[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]] push ผ่าน WebSocket channel แยกต่างหาก เพราะ latency ของ gateway กลาง (เฉลี่ย 150-300ms ตอน rush window) ทำให้แจ้งเตือนช้าเกินไปสำหรับเหตุการณ์ที่ dispatcher ต้องตอบสนองทันที
