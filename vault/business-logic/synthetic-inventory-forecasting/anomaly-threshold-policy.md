---
layer: business-logic
tags: [anomaly, policy]
created: 2025-12-21
links:
  - "[[structure/synthetic-inventory-forecasting/module-anomaly-flagger]]"
  - "[[business-logic/synthetic-inventory-forecasting/anomaly-threshold-policy-edge-cases]]"
---

# นโยบายกำหนด Threshold ความผิดปกติของยอดขาย

[[structure/synthetic-inventory-forecasting/module-anomaly-flagger]] ใช้ z-score ของส่วนต่างระหว่างยอดขายจริงกับพยากรณ์เทียบกับ `ANOMALY_ZSCORE_THRESHOLD` (ค่าปกติ 2.5) เป็นเกณฑ์หลัก แต่ threshold จริงต่างกันตาม volatility ของแต่ละ category — category ที่ผันผวนสูงโดยธรรมชาติ (เช่น เสื้อผ้าตามฤดูกาล) ใช้ threshold สูงกว่า category ที่นิ่ง (เช่น ของใช้ประจำวัน)

anomaly ที่ flag แล้วไม่ได้แปลว่าต้อง action ทันที — เป็นสัญญาณให้คนตรวจสอบก่อนว่าเป็น demand shift จริงหรือปัญหาข้อมูล

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-inventory-forecasting/anomaly-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
