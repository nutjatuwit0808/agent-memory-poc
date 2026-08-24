---
layer: business-logic
tags: [consent, compliance, policy]
created: 2026-08-02
links:
  - "[[structure/synthetic-marketing-automation/module-consent-manager]]"
  - "[[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy-edge-cases]]"
---

# นโยบาย SLA การ Honor คำขอ Unsubscribe

[[structure/synthetic-marketing-automation/module-consent-manager]] ต้องบันทึกคำขอ unsubscribe และมีผลกับทุก send job ที่ยังไม่ dispatch ภายใน `UNSUBSCRIBE_HONOR_SLA_HOURS` (ค่าปกติ 24 ชั่วโมง) แต่ในทางปฏิบัติ `recordOptOut` มีผลทันทีแบบ synchronous ไม่รอถึง SLA เพราะ SLA เป็นแค่เพดานสูงสุดที่กฎหมายกำหนด ไม่ใช่เป้าหมายที่ตั้งใจไปถึง

batch ที่กำลัง `dispatchNextBatch` อยู่พอดีตอนที่มีคำขอ unsubscribe เข้ามา อาจส่งไปแล้วก่อนที่จะเช็คสถานะใหม่ทัน — กรณีนี้ไม่ถือว่าละเมิดนโยบายตราบใดที่ batch ถัดไปเช็คสถานะใหม่ก่อนส่งเสมอ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
