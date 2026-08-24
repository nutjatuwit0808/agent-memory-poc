---
layer: business-logic
tags: [bot, reliability, policy]
created: 2026-05-21
links:
  - "[[business-logic/synthetic-chat-support-bot/reply-loop-detection-policy-edge-cases]]"
---

# นโยบายการตรวจจับ Reply Loop

ระบบตรวจจับกรณี bot ตอบข้อความเดียวกันหรือคล้ายกันมากซ้ำติดต่อกันเกิน 2 ครั้งในบทสนทนาเดียว ถ้าเจอจะหยุดให้ bot ตอบต่อทันทีและส่งต่อเจ้าหน้าที่โดยอัตโนมัติ ไม่รอให้ลูกค้าร้องเรียนเอง

การเทียบว่า "คำตอบคล้ายกัน" ใช้การเทียบ `articleId` ที่ใช้ตอบ ไม่ใช่เทียบข้อความตรงตัว เพราะ bot อาจใช้บทความเดียวกันมาสร้างประโยคคำตอบที่ถ้อยคำต่างกันเล็กน้อยแต่เนื้อหาซ้ำเดิมทุกครั้ง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-chat-support-bot/reply-loop-detection-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
