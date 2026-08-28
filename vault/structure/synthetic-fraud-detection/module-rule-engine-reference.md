---
layer: structure
tags: [rules, module, core, reference, identifiers]
created: 2026-07-23
links:
  - "[[structure/synthetic-fraud-detection/module-rule-engine]]"
  - "[[business-logic/synthetic-fraud-detection/rule-override-approval-policy]]"
---

# rule-engine — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด rule-engine สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-fraud-detection/module-rule-engine]])

## Public functions
- `evaluateSignal(signal: Signal): Promise<RuleResult>` — รัน rule ทุกตัวที่ active กับ signal นี้ คืน partial score และ list ของ rule ที่ trigger
- `activateRule(ruleId: string, activatedBy: string): Promise<void>` — เปิดใช้ rule version ใหม่ บันทึก audit log ดู [[business-logic/synthetic-fraud-detection/rule-override-approval-policy]]
- `deactivateRule(ruleId: string, reason: string, approvedBy: string): Promise<void>` — ปิด rule พร้อมบันทึกเหตุผลและผู้อนุมัติ ห้ามปิดโดยไม่มี approval
- `getRuleHistory(ruleId: string): Promise<RuleVersion[]>` — คืน version history ทั้งหมดของ rule เพื่อ audit ว่า rule เปลี่ยนไปอย่างไร

## Internal constants
- `RULE_ENGINE_VERSION = "2.1"`
- `MAX_RULES_PER_EVALUATION = 200`
- `RULE_EVALUATION_TIMEOUT_MS = 80`

## Type

```ts
interface RuleResult {
  eventId: string;
  triggeredRules: { ruleId: string; score: number; reason: string }[];
  partialScore: number;
  evaluatedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง override approval ที่ [[business-logic/synthetic-fraud-detection/rule-override-approval-policy]]
