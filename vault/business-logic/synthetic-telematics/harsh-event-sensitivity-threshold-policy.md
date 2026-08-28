---
layer: business-logic
tags: [scoring, policy]
created: 2026-04-27
links:
  - "[[structure/synthetic-telematics/module-driving-scorer]]"
  - "[[business-logic/synthetic-telematics/harsh-event-sensitivity-threshold-policy-edge-cases]]"
---

# นโยบายเกณฑ์ความไวการตรวจจับเหตุการณ์รุนแรง

การเบรกกะทันหัน เร่งกะทันหัน หรือเลี้ยวรุนแรง จะถูกนับเป็น harsh event เมื่อค่าความเร่ง/ความหน่วงเกินเกณฑ์ที่กำหนด — เกณฑ์นี้ปรับตามความเร็วขณะเกิดเหตุการณ์ เพราะการเบรกแรงที่ความเร็วต่ำมีความเสี่ยงต่างจากที่ความเร็วสูงมาก

harsh event ทุกครั้งถูกบันทึกไว้ในรายละเอียดเที่ยวการเดินทาง แต่ไม่ได้แปลว่าทุก harsh event จะถูกหักคะแนนเท่ากัน — ดู [[structure/synthetic-telematics/module-driving-scorer]] สำหรับการคำนวณผลกระทบต่อคะแนนจริง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-telematics/harsh-event-sensitivity-threshold-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
