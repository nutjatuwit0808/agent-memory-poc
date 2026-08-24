---
layer: convention
tags: [testing, backtest]
created: 2026-02-02
links:
  - "[[support-cases/synthetic-inventory-forecasting/case-4543]]"
  - "[[support-cases/synthetic-inventory-forecasting/case-6762]]"
---

# Testing Convention

## Backtest ก่อน deploy โมเดล

โมเดลใหม่ทุกเวอร์ชันต้องผ่าน backtest เทียบกับเวอร์ชันปัจจุบันบนข้อมูลย้อนหลังอย่างน้อย 8 สัปดาห์ก่อน deploy เสมอ — บทเรียนจาก [[support-cases/synthetic-inventory-forecasting/case-4543]] คือต้องใช้ feature แบบ point-in-time เท่านั้นใน backtest ห้ามใช้ค่า "ล่าสุด" ที่อาจรั่วข้อมูลอนาคต

## Test ข้อมูลผิดหน่วย

ฟังก์ชันที่รับ input ยอดขายจริงต้องมี test กรณีหน่วยไม่ตรงกับที่โมเดลฝึกไว้เสมอ (บทเรียนจาก [[support-cases/synthetic-inventory-forecasting/case-6762]])
