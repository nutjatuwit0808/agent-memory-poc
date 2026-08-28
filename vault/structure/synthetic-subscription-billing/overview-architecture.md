---
layer: structure
tags: [subscription-billing, recurflow, architecture, overview]
created: 2025-09-26
links:
  - "[[structure/synthetic-subscription-billing/module-plan-manager]]"
  - "[[structure/synthetic-subscription-billing/module-proration-calculator]]"
  - "[[structure/synthetic-subscription-billing/module-dunning-engine]]"
  - "[[structure/synthetic-subscription-billing/module-invoice-generator]]"
  - "[[structure/synthetic-subscription-billing/module-usage-meter]]"
  - "[[structure/synthetic-subscription-billing/module-trial-controller]]"
---

# ภาพรวมสถาปัตยกรรม RecurFlow — ระบบบริหารรายได้ประจำสำหรับ SaaS

RecurFlow คือระบบบริหารวงจรชีวิต subscription สำหรับผลิตภัณฑ์ SaaS จัดการการเปลี่ยนแพลน (upgrade/downgrade) การคำนวณ proration เมื่อเปลี่ยนแพลนกลางรอบบิล กระบวนการ dunning เมื่อชำระเงินไม่สำเร็จ การสร้างใบแจ้งหนี้ และการวัดปริมาณการใช้งานสำหรับแพลนที่คิดค่าบริการตามการใช้งานจริง

ทีมวิศวกรรมออกแบบระบบให้แยก 'การคำนวณ' ออกจาก 'การเรียกเก็บเงินจริง' อย่างชัดเจน เพราะการคำนวณ proration และใบแจ้งหนี้มีกฎทางธุรกิจซับซ้อนที่เปลี่ยนบ่อย ในขณะที่การเรียกเก็บเงินจริงต้องมีความแน่นอนสูงและ audit ได้ทุกขั้นตอน แยกกันชัดเจนช่วยให้แก้กฎธุรกิจได้โดยไม่กระทบความน่าเชื่อถือของการเรียกเก็บเงิน

## Module หลัก

- **plan-manager** — จัดการสถานะแพลนปัจจุบันของทุก subscription และการเปลี่ยนแพลน (upgrade/downgrade) ดู [[structure/synthetic-subscription-billing/module-plan-manager]]
- **proration-calculator** — คำนวณส่วนต่างค่าบริการเมื่อเปลี่ยนแพลนกลางรอบบิล เป็น pure calculation ไม่เก็บ s ดู [[structure/synthetic-subscription-billing/module-proration-calculator]]
- **dunning-engine** — จัดการกระบวนการเรียกเก็บเงินซ้ำเมื่อการชำระเงินครั้งแรกล้มเหลว ตามตารางเวลา retr ดู [[structure/synthetic-subscription-billing/module-dunning-engine]]
- **invoice-generator** — สร้างใบแจ้งหนี้จากข้อมูลแพลนปัจจุบัน ผล proration และการใช้งานที่วัดได้ ไม่คำนวณ ดู [[structure/synthetic-subscription-billing/module-invoice-generator]]
- **usage-meter** — วัดปริมาณการใช้งานสำหรับแพลนที่คิดค่าบริการตามการใช้งานจริง (usage-based pricing ดู [[structure/synthetic-subscription-billing/module-usage-meter]]
- **trial-controller** — จัดการช่วงทดลองใช้ฟรี (free trial) ตั้งแต่เริ่มต้น การขยายเวลาในกรณีพิเศษ ไปจนถึ ดู [[structure/synthetic-subscription-billing/module-trial-controller]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-subscription-billing/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-subscription-billing/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-subscription-billing/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-subscription-billing/database-schema]]
