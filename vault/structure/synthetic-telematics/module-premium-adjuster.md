---
layer: structure
tags: [premium, module]
created: 2026-04-12
links:
  - "[[business-logic/synthetic-telematics/premium-adjustment-cap-policy]]"
---

# Module: premium-adjuster

ปรับเบี้ยประกันตามคะแนนพฤติกรรมการขับขี่ที่คำนวณได้ อ่านผลจาก driving-scorer เท่านั้น ไม่คำนวณคะแนนเอง แยกออกมาเป็น service อิสระเพราะการปรับเบี้ยมีกฎทางธุรกิจและข้อจำกัดทางกฎหมายที่ซับซ้อนกว่าการคำนวณคะแนนดิบมาก

## ฟังก์ชันหลัก
- `calculateAdjustment(policyholderId: string, score: OverallScore): Promise<PremiumAdjustment>` — คำนวณการปรับเบี้ยประกันตามคะแนนล่าสุด
- `applyAdjustment(adjustmentId: string): Promise<void>` — นำการปรับเบี้ยไปใช้จริงกับกรมธรรม์
- `getAdjustmentHistory(policyholderId: string): Promise<PremiumAdjustment[]>` — คืนประวัติการปรับเบี้ยทั้งหมด

## ความสัมพันธ์กับ module อื่น

การปรับเบี้ยแต่ละครั้งมีเพดานสูงสุดตาม [[business-logic/synthetic-telematics/premium-adjustment-cap-policy]] ไม่ปรับเกินเพดานไม่ว่าคะแนนจะดีหรือแย่แค่ไหนก็ตาม
