---
layer: business-logic
tags: [forecasting, retrain, policy]
created: 2026-04-16
links:
  - "[[structure/synthetic-inventory-forecasting/module-forecast-accuracy-tracker]]"
  - "[[convention/synthetic-inventory-forecasting/testing-convention]]"
  - "[[business-logic/synthetic-inventory-forecasting/model-retrain-policy-edge-cases]]"
---

# นโยบายการ Retrain โมเดลพยากรณ์

SKU ที่ถูก [[structure/synthetic-inventory-forecasting/module-forecast-accuracy-tracker]] ตรวจพบว่า WAPE เกิน 30% ติดต่อกัน 2 สัปดาห์ จะถูกเสนอเข้าคิว retrain อัตโนมัติ นอกจากนี้ยังมี full retrain ตามรอบทุกไตรมาสสำหรับทุก category ไม่ว่าค่า accuracy จะเป็นอย่างไร

retrain ไม่ได้แปลว่าโมเดลใหม่จะถูก deploy ทันที — ต้องผ่าน backtest เทียบกับโมเดลปัจจุบันก่อนเสมอ (ดู [[convention/synthetic-inventory-forecasting/testing-convention]]) ถ้า backtest ไม่ดีกว่าเดิมชัดเจน จะไม่ deploy

## ทำไมไม่ retrain ทุกคืน

การ retrain ใช้ compute สูงและมีความเสี่ยงที่โมเดลใหม่จะแย่กว่าเดิมถ้าข้อมูลช่วงนั้นผิดปกติ (เช่น ช่วงโปรโมชัน) การ retrain ทุกคืนจะทำให้โมเดล "แกว่ง" ตามสัญญาณรบกวนระยะสั้นแทนที่จะจับ pattern ระยะยาวที่แท้จริง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-inventory-forecasting/model-retrain-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
