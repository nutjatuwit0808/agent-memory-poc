---
layer: structure
tags: [budget, module, core]
created: 2026-03-11
links:
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
  - "[[business-logic/synthetic-ad-bidding/budget-pacing-policy]]"
---

# Module: budget-pacer

ควบคุมอัตราการใช้ budget ของแต่ละแคมเปญให้กระจายตลอดทั้งวันแทนที่จะหมดเร็วเกินไปตอนเช้าหรือช้าเกินไปตอนดึก แยกเป็น service อิสระเพราะ logic pacing (การพยากรณ์ traffic, การปรับ throttle rate) ซับซ้อนและต้องทดสอบแยกจาก auction logic

## ฟังก์ชันหลัก
- `getRemainingBudget(campaignId: string): Promise<number>` — คืนยอด budget คงเหลือของแคมเปญ ณ ขณะนั้น
- `recordSpend(campaignId: string, amount: number, winNoticeId: string): Promise<void>` — บันทึกยอดที่ใช้ไปจริงจาก win notice
- `computeThrottleRate(campaignId: string): Promise<number>` — คำนวณสัดส่วน bid ที่ควรเข้าประมูลจริงเทียบกับ eligible ทั้งหมด เพื่อ pace การใช้เงิน

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-ad-bidding/module-auction-engine]] เรียก `getRemainingBudget` ทุกครั้งก่อนคำนวณราคา — ไม่ cache ค่า budget ไว้เกิน 1 วินาที เพราะความเสี่ยง overspend สำคัญกว่า latency เล็กน้อยที่เสียไป ดู [[business-logic/synthetic-ad-bidding/budget-pacing-policy]]
