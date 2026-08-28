---
layer: structure
tags: [spc, module, core, reference, identifiers]
created: 2026-07-21
links:
  - "[[structure/synthetic-quality-control/module-spc-analyzer]]"
  - "[[business-logic/synthetic-quality-control/control-chart-rule-policy]]"
---

# spc-analyzer — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด spc-analyzer สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-quality-control/module-spc-analyzer]])

## Public functions
- `computeControlLimits(runId: string, chartType: ChartType): Promise<ControlLimits>` — คำนวณ UCL/LCL จากข้อมูลประวัติของ process นั้น
- `evaluatePoint(runId: string, measurementId: string): Promise<RuleViolation[]>` — ตรวจว่าจุดนั้นละเมิด Western Electric rule ข้อใดบ้าง
- `getRuleViolationsForRun(runId: string): Promise<RuleViolation[]>` — ดึง violation ทั้งหมดของ run นั้นในลำดับเวลา
- `updateProcessParameters(productLineId: string, params: SpcParameters): Promise<void>` — อัปเดต parameter ที่ใช้คำนวณ control limit สำหรับ product line นั้น

## Internal constants
- `MINIMUM_POINTS_FOR_CONTROL_LIMIT = 25`
- `WESTERN_ELECTRIC_ZONE_A_SIGMA = 3`
- `WESTERN_ELECTRIC_ZONE_B_SIGMA = 2`
- `WESTERN_ELECTRIC_ZONE_C_SIGMA = 1`

## Type

```ts
interface RuleViolation {
  measurementId: string;
  ruleNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  severity: "warning" | "action";
  description: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule ของ control chart ที่ [[business-logic/synthetic-quality-control/control-chart-rule-policy]]
