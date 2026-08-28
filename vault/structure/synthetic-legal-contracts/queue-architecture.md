---
layer: structure
tags: [legal-contracts, lexdraft, queue, async]
created: 2025-12-29
links:
  - "[[structure/synthetic-legal-contracts/module-obligation-tracker]]"
  - "[[structure/synthetic-legal-contracts/module-renewal-monitor]]"
  - "[[business-logic/synthetic-legal-contracts/renewal-notice-period-policy]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `contract.approved`, `contract.signed`, `contract.renewal_due`, `obligation.milestone_reached`, `template.published` — [[structure/synthetic-legal-contracts/module-obligation-tracker]] subscribe `contract.signed` เพื่อเริ่มสร้าง obligation record อัตโนมัติจากเงื่อนไขในสัญญา

[[structure/synthetic-legal-contracts/module-renewal-monitor]] รัน scheduled job ตรวจ contract ที่ใกล้หมดอายุทุกวัน แล้ว publish `contract.renewal_due` ให้ทีม legal ops รับทราบล่วงหน้าตามที่กำหนดใน [[business-logic/synthetic-legal-contracts/renewal-notice-period-policy]]
