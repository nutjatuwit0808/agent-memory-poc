---
layer: structure
tags: [rules, module, core]
created: 2025-12-29
links:
  - "[[business-logic/synthetic-fraud-detection/rule-override-approval-policy]]"
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
  - "[[structure/synthetic-fraud-detection/module-case-manager]]"
---

# Module: rule-engine

ประเมิน signal ด้วยชุด rule แบบ deterministic ให้ partial score และ rule_flags ที่อ่านออกได้ทันที แยกออกมาจาก ml-scorer เพื่อให้ทีม ops เข้าใจและแก้ rule ได้โดยไม่ต้องรู้ ML เลย rule แต่ละตัว versioned และ auditable ทุก change

## ฟังก์ชันหลัก
- `evaluateSignal(signal: Signal): Promise<RuleResult>` — รัน rule ทุกตัวที่ active กับ signal นี้ คืน partial score และ list ของ rule ที่ trigger
- `activateRule(ruleId: string, activatedBy: string): Promise<void>` — เปิดใช้ rule version ใหม่ บันทึก audit log ดู [[business-logic/synthetic-fraud-detection/rule-override-approval-policy]]
- `deactivateRule(ruleId: string, reason: string, approvedBy: string): Promise<void>` — ปิด rule พร้อมบันทึกเหตุผลและผู้อนุมัติ ห้ามปิดโดยไม่มี approval
- `getRuleHistory(ruleId: string): Promise<RuleVersion[]>` — คืน version history ทั้งหมดของ rule เพื่อ audit ว่า rule เปลี่ยนไปอย่างไร

## State

signal_received → rules_evaluated → scored (partial) → published_to_case_manager

## ความสัมพันธ์กับ module อื่น

ไม่รู้จักผล score ของ [[structure/synthetic-fraud-detection/module-ml-scorer]] เลยในขณะที่ตัวเองกำลัง evaluate — rule และ ML score ถูก aggregate ที่ [[structure/synthetic-fraud-detection/module-case-manager]] ในภายหลัง เพื่อไม่ให้ rule logic ผสมกับ ML logic ในจุดเดียว
