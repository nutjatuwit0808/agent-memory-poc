---
layer: structure
tags: [negotiation, module]
created: 2026-03-09
links:
  - "[[business-logic/synthetic-legal-contracts/clause-negotiation-round-limit-policy]]"
---

# Module: clause-negotiator

ติดตามการเจรจาต่อรองเงื่อนไข (redline) ระหว่างองค์กรกับคู่สัญญาภายนอก เก็บทุกรอบการแก้ไขไว้เป็นประวัติเพื่อให้ทนายความย้อนดูได้ว่าเงื่อนไขไหนถูกต่อรองไปมาอย่างไรก่อนจะสรุปเป็นฉบับสุดท้าย

## ฟังก์ชันหลัก
- `submitRedline(contractId: string, changes: ClauseChange[], party: string): Promise<string>` — ส่ง redline รอบใหม่ คืน redlineId
- `acceptRedline(redlineId: string): Promise<void>` — ยอมรับ redline รอบนั้น นำเข้าเป็นเนื้อหาสัญญาปัจจุบัน
- `getNegotiationHistory(contractId: string): Promise<RedlineRound[]>` — คืนประวัติการเจรจาทั้งหมดของสัญญาฉบับหนึ่ง

## ความสัมพันธ์กับ module อื่น

จำนวนรอบการเจรจาต่อสัญญาหนึ่งฉบับมีเพดานตาม [[business-logic/synthetic-legal-contracts/clause-negotiation-round-limit-policy]] — เกินเพดานต้อง escalate ให้หัวหน้าทีมกฎหมายตัดสินใจแทนระบบอัตโนมัติ
