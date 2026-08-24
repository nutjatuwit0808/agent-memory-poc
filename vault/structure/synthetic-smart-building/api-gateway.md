---
layer: structure
tags: [smart-building, atrium, gateway, api]
created: 2026-01-17
links:
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
  - "[[structure/synthetic-smart-building/module-access-control-gateway]]"
---

# API Gateway

คำสั่งจากแอปมือถือของพนักงานอาคาร (เช่น ปรับอุณหภูมิห้องประชุม, ขอเปิดประตูนอกเวลา) เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่ง route ต่อไปยัง [[structure/synthetic-smart-building/module-hvac-controller]] หรือ [[structure/synthetic-smart-building/module-access-control-gateway]] ตามประเภทคำขอ

คำสั่งที่เกี่ยวกับความปลอดภัยระดับฉุกเฉิน เช่น fire alarm unlock-all ไม่ผ่าน API gateway กลาง — [[structure/synthetic-smart-building/module-access-control-gateway]] รับสัญญาณ fire panel โดยตรงผ่านสาย hardwired แยกต่างหาก เพราะ latency ของ gateway กลาง (เฉลี่ย 100-200ms รวม network hop ระหว่าง cloud กับ edge) ช้าเกินไปสำหรับสถานการณ์ที่ต้องปลดล็อกทุกประตูให้คนอพยพทันที
