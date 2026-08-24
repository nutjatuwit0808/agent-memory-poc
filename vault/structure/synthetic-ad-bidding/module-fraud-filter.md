---
layer: structure
tags: [fraud, module]
created: 2025-09-19
links:
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
  - "[[structure/synthetic-ad-bidding/service-boundaries]]"
  - "[[business-logic/synthetic-ad-bidding/fraud-score-threshold-policy]]"
---

# Module: fraud-filter

ตรวจจับ bid request ที่มาจาก traffic ผิดปกติ (bot, datacenter IP, click farm pattern) ก่อนที่จะเสียเงินประมูลให้ traffic ที่ไม่มีมูลค่าจริง แยกเป็น service อิสระเพื่อให้ปรับ rule ได้เร็วโดยไม่กระทบ deploy cycle ของ auction-engine

## ฟังก์ชันหลัก
- `scoreRequest(req: InternalBidRequest): Promise<FraudScore>` — ให้คะแนน fraud 0-100 พร้อมเหตุผลที่ประกอบคะแนน
- `evaluateRule(ruleId: string, req: InternalBidRequest): RuleResult` — ประเมิน rule เดี่ยวๆ ตัวหนึ่ง ใช้ตอน debug ว่า rule ไหนที่ทำให้คะแนนสูง
- `reportFalsePositive(requestId: string, reportedBy: string): Promise<void>` — บันทึกกรณีที่ถูก block ผิดพลาด ใช้ปรับปรุง rule ทีหลัง

## ความสัมพันธ์กับ module อื่น

ทำงานก่อน [[structure/synthetic-ad-bidding/module-auction-engine]] เสมอในลำดับ pipeline (ดู [[structure/synthetic-ad-bidding/service-boundaries]]) เกณฑ์ threshold ที่ใช้ block หรือปล่อยผ่านกำหนดโดย [[business-logic/synthetic-ad-bidding/fraud-score-threshold-policy]]
