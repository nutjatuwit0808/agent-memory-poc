---
layer: structure
tags: [usage, module, core]
created: 2026-07-20
links:
  - "[[business-logic/synthetic-subscription-billing/usage-overage-billing-policy]]"
---

# Module: usage-meter

วัดปริมาณการใช้งานสำหรับแพลนที่คิดค่าบริการตามการใช้งานจริง (usage-based pricing) เก็บเป็น time-series และคำนวณยอดรวมสำหรับรอบบิล เป็น service เดียวที่นับปริมาณการใช้งาน ไม่มี service อื่นนับซ้ำเอง

## ฟังก์ชันหลัก
- `recordUsage(subscriptionId: string, metric: string, quantity: number): Promise<void>` — บันทึกการใช้งาน 1 รายการ
- `getUsageTotal(subscriptionId: string, metric: string, period: TimeRange): Promise<number>` — คืนยอดรวมการใช้งานในช่วงเวลาที่กำหนด
- `checkOverageThreshold(subscriptionId: string, metric: string): Promise<OverageStatus>` — ตรวจสอบว่าการใช้งานเกินโควตาแพลนหรือไม่

## ความสัมพันธ์กับ module อื่น

publish event `usage.threshold_exceeded` เมื่อการใช้งานเกินโควตา ให้ทีม billing และลูกค้าได้รับแจ้งเตือนก่อนใบแจ้งหนี้จะออก ดู [[business-logic/synthetic-subscription-billing/usage-overage-billing-policy]]
