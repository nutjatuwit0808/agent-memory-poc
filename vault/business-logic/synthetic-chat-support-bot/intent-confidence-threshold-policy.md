---
layer: business-logic
tags: [intent, confidence, policy]
created: 2026-01-12
links:
  - "[[structure/synthetic-chat-support-bot/module-intent-classifier]]"
  - "[[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy-edge-cases]]"
---

# นโยบายเกณฑ์ Confidence ของการจำแนก Intent

เมื่อ [[structure/synthetic-chat-support-bot/module-intent-classifier]] จำแนก intent ได้ ระบบจะเปรียบเทียบค่า confidence กับ `INTENT_CONFIDENCE_MIN_THRESHOLD` (ค่าปกติ 0.72) ถ้าต่ำกว่านี้จะไม่ใช้ผลจำแนกนั้นตอบลูกค้าโดยตรง แต่จะ fallback ไปถามคำถามเพิ่มเติมเพื่อยืนยันความต้องการก่อน

การถามยืนยันทำได้ไม่เกิน 1 ครั้งต่อบทสนทนา ถ้ายืนยันแล้วยัง confidence ต่ำอยู่ ระบบจะส่งต่อเจ้าหน้าที่ทันทีแทนการถามซ้ำไปเรื่อยๆ เพราะการถามซ้ำหลายรอบทำให้ลูกค้ารู้สึกว่า bot ไม่เข้าใจและหงุดหงิดมากกว่าการส่งต่อคนตั้งแต่ต้น

## ทำไมไม่ตั้ง threshold ต่ำกว่านี้เพื่อลดการส่งต่อเจ้าหน้าที่

ทีมเคยทดลองลด threshold ลงเพื่อให้ bot ตอบเองได้มากขึ้น แต่พบว่าคำตอบผิด intent ที่หลุดออกไปสร้างความไม่พอใจของลูกค้ารุนแรงกว่าการส่งต่อเจ้าหน้าที่บ่อยขึ้นมาก เพราะลูกค้ารู้สึกว่า bot ไม่ฟังเลยไม่ใช่แค่ตอบช้า

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
