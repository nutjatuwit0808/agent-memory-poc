---
layer: business-logic
tags: [shipment, tracking, staleness, policy]
created: 2026-08-08
links:
  - "[[structure/synthetic-supply-chain/module-shipment-tracker]]"
---

# นโยบายจัดการ Shipment Tracking ที่ล้าสมัย

ถ้า [[structure/synthetic-supply-chain/module-shipment-tracker]] ไม่ได้รับ milestone update จากซัพพลายเออร์หรือ carrier เกิน 48 ชั่วโมงสำหรับ shipment ที่ยังอยู่ระหว่างทาง จะส่ง alert ให้ procurement team ตามไปถามซัพพลายเออร์โดยตรง

Shipment ที่ไม่มี update เกิน 7 วันจะถูก escalate ให้ผู้บริหาร เพราะอาจหมายความว่าสินค้าหายหรือซัพพลายเออร์มีปัญหาร้ายแรงที่ไม่ได้แจ้ง ซัพพลายเออร์ที่ tracking staleness เกิดซ้ำมากกว่า 3 ครั้งในไตรมาสจะถูกบันทึกเป็น communication penalty ใน performance record
