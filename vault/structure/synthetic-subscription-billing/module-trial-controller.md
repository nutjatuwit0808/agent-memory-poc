---
layer: structure
tags: [trial, module]
created: 2026-06-16
links:
  - "[[business-logic/synthetic-subscription-billing/trial-length-extension-rules-policy]]"
---

# Module: trial-controller

จัดการช่วงทดลองใช้ฟรี (free trial) ตั้งแต่เริ่มต้น การขยายเวลาในกรณีพิเศษ ไปจนถึงการแปลงเป็น subscription แบบชำระเงินเมื่อ trial สิ้นสุด แยกออกมาเป็น service อิสระเพราะ trial มีสถานะและกฎที่ต่างจาก subscription ที่ชำระเงินแล้วโดยสิ้นเชิง

## ฟังก์ชันหลัก
- `startTrial(accountId: string, planId: string): Promise<string>` — เริ่มช่วงทดลองใช้ฟรี คืน trialId
- `extendTrial(trialId: string, additionalDays: number, reason: string): Promise<void>` — ขยายเวลาทดลองใช้ในกรณีพิเศษ ต้องระบุเหตุผล
- `convertToSubscription(trialId: string, paymentMethodId: string): Promise<string>` — แปลง trial เป็น subscription ที่ชำระเงินจริง

## State

active → extended (optional) → converted | expired — ดู [[business-logic/synthetic-subscription-billing/trial-length-extension-rules-policy]]

## ความสัมพันธ์กับ module อื่น

publish event `trial.expiring` ล่วงหน้าก่อน trial หมดอายุ ให้ลูกค้ามีเวลาตัดสินใจก่อนแปลงเป็นชำระเงินหรือปล่อยให้หมดอายุ
