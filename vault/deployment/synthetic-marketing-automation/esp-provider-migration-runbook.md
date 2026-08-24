---
layer: deployment
tags: [migration, runbook]
created: 2025-12-13
links:
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[structure/synthetic-marketing-automation/module-deliverability-monitor]]"
  - "[[business-logic/synthetic-marketing-automation/sender-domain-reputation-policy]]"
---

# ESP Provider Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อเปลี่ยนหรือเพิ่ม ESP ผู้ให้บริการส่งอีเมลรายใหม่ ต้อง migrate การตั้งค่า rate limit, sending domain, และ webhook endpoint ใน [[structure/synthetic-marketing-automation/module-send-scheduler]] และ [[structure/synthetic-marketing-automation/module-deliverability-monitor]] พร้อมกัน

## ขั้นตอน

1) ตั้งค่า ESP ใหม่แบบ parallel กับตัวเดิม 2) รัน warm-up ตาม [[business-logic/synthetic-marketing-automation/sender-domain-reputation-policy]] 3) ทดสอบส่ง campaign ขนาดเล็กก่อน 4) ค่อยๆ เพิ่มสัดส่วน traffic ไปยัง ESP ใหม่ ไม่ตัด ESP เดิมทันที
