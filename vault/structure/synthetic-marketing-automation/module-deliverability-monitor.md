---
layer: structure
tags: [deliverability, module]
created: 2025-11-17
links:
  - "[[structure/synthetic-marketing-automation/module-campaign-builder]]"
  - "[[business-logic/synthetic-marketing-automation/deliverability-suppression-policy]]"
---

# Module: deliverability-monitor

เฝ้าระวังอัตรา bounce, complaint, และสถานะ blacklist ของ sending domain แบบ real-time ระหว่างและหลังการส่ง เป็น service เดียวที่มีสิทธิ์สั่ง `pauseSendJob` โดยอัตโนมัติโดยไม่ต้องรอคนอนุมัติ เพราะความเสี่ยงต่อ sender reputation กระทบทุก campaign ในอนาคต ไม่ใช่แค่ campaign ปัจจุบัน

## ฟังก์ชันหลัก
- `evaluateBounceRate(jobId: string): Promise<DeliverabilityStatus>` — ประเมิน bounce rate ของ batch ที่ส่งไปล่าสุดเทียบกับ threshold
- `checkDomainBlacklist(domain: string): Promise<BlacklistStatus>` — เช็คสถานะ blacklist ของ sending domain กับ ESP reputation service ภายนอก
- `triggerSendPause(jobId: string, reason: string): Promise<void>` — สั่งหยุด send job ทันทีเมื่อ metric เกินเกณฑ์อันตราย

## ความสัมพันธ์กับ module อื่น

การสั่ง pause ไม่ผ่าน [[structure/synthetic-marketing-automation/module-campaign-builder]] เลย เพื่อลด latency ของการตอบสนอง ดู [[business-logic/synthetic-marketing-automation/deliverability-suppression-policy]] สำหรับเกณฑ์ที่ใช้ตัดสินใจ
