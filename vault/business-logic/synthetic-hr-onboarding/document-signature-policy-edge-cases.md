---
layer: business-logic
tags: [document, vendor-outage, edge-case]
created: 2025-09-25
links:
  - "[[business-logic/synthetic-hr-onboarding/document-signature-policy]]"
---

# ข้อยกเว้นเมื่อ Vendor แจ้ง Outage ล่วงหน้า

ถ้า e-signature vendor ประกาศ maintenance window ล่วงหน้า ทีมจะปิดการ mark `stuck` อัตโนมัติชั่วคราวสำหรับเอกสารที่อยู่ในช่วงเวลานั้น เพื่อไม่ให้เกิด false alert จำนวนมากพร้อมกัน

หลัง maintenance window ผ่านไป ระบบจะ query สถานะเอกสารทั้งหมดที่ค้างระหว่างนั้นด้วยมือครั้งเดียวแทนการรอ webhook ที่อาจไม่ถูกส่งซ้ำจาก vendor

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-hr-onboarding/document-signature-policy]] ("นโยบายเอกสารเซ็นค้าง (Document Stuck)") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
