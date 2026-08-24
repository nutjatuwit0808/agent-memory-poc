---
layer: business-logic
tags: [energy, demand-response, policy]
created: 2026-03-07
links:
  - "[[structure/synthetic-smart-building/module-energy-optimizer]]"
  - "[[structure/synthetic-smart-building/module-hvac-controller]]"
---

# นโยบายการตอบสนอง Demand Response

เมื่อการไฟฟ้าส่งสัญญาณ demand response event [[structure/synthetic-smart-building/module-energy-optimizer]] จะปรับ comfort band ให้กว้างขึ้นชั่วคราว (เพิ่มได้สูงสุด 2°C จาก `COMFORT_BAND_C` ปกติ) เพื่อลดโหลดตามที่ตกลงกับการไฟฟ้าไว้

การปรับ comfort band ระหว่าง demand response event ยังคงต้องผ่าน [[structure/synthetic-smart-building/module-hvac-controller]] ตัดสินใจอีกชั้นเหมือนคำแนะนำปกติ ไม่มีสิทธิ์พิเศษข้ามการตรวจ manual override
