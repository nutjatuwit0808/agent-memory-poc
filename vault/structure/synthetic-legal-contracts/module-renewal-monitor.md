---
layer: structure
tags: [renewal, module]
created: 2026-04-18
links:
  - "[[business-logic/synthetic-legal-contracts/renewal-notice-period-policy]]"
---

# Module: renewal-monitor

ตรวจสอบสัญญาที่ใกล้หมดอายุและแจ้งเตือนทีม legal ops ล่วงหน้าตามระยะเวลาที่กำหนด แยกออกมาเป็น service อิสระเพราะการแจ้งเตือนต่ออายุต้องรันเป็น scheduled job ตลอดเวลา ไม่ใช่ทำงานแบบ request-response เหมือน service อื่น

## ฟังก์ชันหลัก
- `scanExpiringContracts(withinDays: number): Promise<ContractSummary[]>` — สแกนหาสัญญาที่จะหมดอายุภายในจำนวนวันที่กำหนด
- `sendRenewalReminder(contractId: string): Promise<void>` — ส่งการแจ้งเตือนต่ออายุให้ทีมที่เกี่ยวข้อง
- `markRenewalHandled(contractId: string, decision: "renew" | "terminate"): Promise<void>` — บันทึกการตัดสินใจของทีมเกี่ยวกับสัญญาที่ใกล้หมดอายุ

## ความสัมพันธ์กับ module อื่น

รัน scheduled job ทุกวันตรวจสัญญาทั้งหมด ไม่พึ่ง event-driven trigger เพราะการแจ้งเตือนต่ออายุต้องเกิดขึ้นแน่นอนแม้ไม่มี action อื่นใดเกิดขึ้นกับสัญญาฉบับนั้นเลยก็ตาม ดู [[business-logic/synthetic-legal-contracts/renewal-notice-period-policy]]
