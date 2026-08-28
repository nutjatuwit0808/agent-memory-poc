---
layer: structure
tags: [case, module]
created: 2025-11-21
links:
  - "[[structure/synthetic-fraud-detection/module-rule-engine]]"
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
  - "[[business-logic/synthetic-fraud-detection/score-threshold-policy]]"
  - "[[business-logic/synthetic-fraud-detection/analyst-review-sla-policy]]"
---

# Module: case-manager

รวม output จาก [[structure/synthetic-fraud-detection/module-rule-engine]] และ [[structure/synthetic-fraud-detection/module-ml-scorer]] แล้วตัดสินใจ final action (block, review, allow) ตาม policy สร้าง fraud case สำหรับ event ที่ต้องให้ analyst ดู และบริหารจัดการ queue การ review ให้อยู่ใน SLA ที่กำหนด ทุก decision มี audit trail ที่ service นี้เก็บไว้

## ฟังก์ชันหลัก
- `processScores(ruleResult: RuleResult, mlScore: MLScore): Promise<Decision>` — รวม score สองแหล่งแล้วตัดสินใจ action สุดท้ายตาม [[business-logic/synthetic-fraud-detection/score-threshold-policy]]
- `createCase(eventId: string, decision: Decision): Promise<FraudCase>` — สร้าง case ใหม่สำหรับ event ที่ต้อง review และใส่ลงใน analyst queue
- `resolveCase(caseId: string, resolution: Resolution, resolvedBy: string): Promise<void>` — ปิด case พร้อมบันทึก resolution ของ analyst
- `getQueueStats(): Promise<QueueStats>` — คืนสถิติของ review queue เช่น depth, average wait time, SLA breach rate

## ความสัมพันธ์กับ module อื่น

เป็น service เดียวที่ client application รอ response เพื่อตัดสินใจว่าจะ allow หรือ block action — ทำให้ latency ของ case-manager ส่งผล UX ตรงๆ ดู [[business-logic/synthetic-fraud-detection/analyst-review-sla-policy]] สำหรับ target latency
