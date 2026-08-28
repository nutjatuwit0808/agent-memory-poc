---
layer: structure
tags: [asset-management, assettrack, gateway, api]
created: 2026-03-04
links:
  - "[[structure/synthetic-asset-management/module-assignment-tracker]]"
  - "[[structure/synthetic-asset-management/module-disposal-workflow]]"
---

# API Gateway

คำขอจากระบบ HR หรือ ERP ภายนอกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ auth และ rate limit ก่อนส่งต่อให้แต่ละ module คำขอประเภท "เช็คว่าพนักงานมีอุปกรณ์อะไรบ้าง" ใช้ synchronous call ผ่าน [[structure/synthetic-asset-management/module-assignment-tracker]] ตรงนี้

การแจ้ง disposal request จากพนักงานเข้ามาทาง self-service portal แยกต่างหาก ซึ่ง route ตรงไปยัง [[structure/synthetic-asset-management/module-disposal-workflow]] โดยไม่ผ่าน API gateway หลัก เพราะ portal มี auth และ audit trail ของตัวเองตามข้อกำหนด compliance
