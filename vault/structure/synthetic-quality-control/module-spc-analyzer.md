---
layer: structure
tags: [spc, module, core]
created: 2026-04-07
links:
  - "[[structure/synthetic-quality-control/module-measurement-collector]]"
  - "[[structure/synthetic-quality-control/module-batch-inspector]]"
  - "[[business-logic/synthetic-quality-control/control-chart-rule-policy]]"
---

# Module: spc-analyzer

ดึงข้อมูลวัดจาก [[structure/synthetic-quality-control/module-measurement-collector]] มาคำนวณ control chart แบบ Western Electric rules ตรวจว่าจุดไหนละเมิด rule ข้อใดบ้าง แล้ว publish event แจ้ง [[structure/synthetic-quality-control/module-batch-inspector]] สร้างขึ้นมาเป็น service แยกเพราะ algorithm SPC มีความซับซ้อนของตัวเองและต้องการ parameter ของแต่ละ product line แตกต่างกัน

## ฟังก์ชันหลัก
- `computeControlLimits(runId: string, chartType: ChartType): Promise<ControlLimits>` — คำนวณ UCL/LCL จากข้อมูลประวัติของ process นั้น
- `evaluatePoint(runId: string, measurementId: string): Promise<RuleViolation[]>` — ตรวจว่าจุดนั้นละเมิด Western Electric rule ข้อใดบ้าง
- `getRuleViolationsForRun(runId: string): Promise<RuleViolation[]>` — ดึง violation ทั้งหมดของ run นั้นในลำดับเวลา
- `updateProcessParameters(productLineId: string, params: SpcParameters): Promise<void>` — อัปเดต parameter ที่ใช้คำนวณ control limit สำหรับ product line นั้น

## State

chart: initializing (รอข้อมูลพอ) → stable (มีข้อมูลพอคำนวณ limit) → out_of_control (มี violation) — in_control กลับมาเองเมื่อจุดใหม่ไม่ละเมิด rule

## ความสัมพันธ์กับ module อื่น

ไม่มีสิทธิ์ตัดสินใจว่า batch ผ่านหรือไม่ผ่าน — ส่งแค่ violation event ให้ [[structure/synthetic-quality-control/module-batch-inspector]] ตัดสินใจต่อ เพื่อให้ business logic รวมอยู่ที่จุดเดียว ดู [[business-logic/synthetic-quality-control/control-chart-rule-policy]] สำหรับรายละเอียด rule ทั้ง 8 ข้อ
