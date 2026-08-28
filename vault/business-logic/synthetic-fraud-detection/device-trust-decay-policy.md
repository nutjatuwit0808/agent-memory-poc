---
layer: business-logic
tags: [device, trust, policy]
created: 2026-01-18
links:
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
  - "[[business-logic/synthetic-fraud-detection/device-trust-decay-policy-edge-cases]]"
---

# นโยบาย Device Trust Decay

trust score ของ device เริ่มต้นที่ 50 สำหรับ device ที่ไม่เคยเห็นมาก่อน และเพิ่มขึ้นช้าๆ เมื่อ device มีประวัติ legitimate transaction ต่อเนื่อง trust score ลดลงเมื่อพบ suspicious behavior และไม่สามารถ recover กลับมาเองได้ — ต้องผ่านกระบวนการ manual review

device ที่มี trust score ต่ำกว่า 20 จะถูก flag ว่า `untrusted` และ [[structure/synthetic-fraud-detection/module-ml-scorer]] จะได้รับ signal นี้เป็น feature weight พิเศษ ส่งผล ML score สูงขึ้นแม้ behavior อื่นจะดูปกติ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-fraud-detection/device-trust-decay-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
