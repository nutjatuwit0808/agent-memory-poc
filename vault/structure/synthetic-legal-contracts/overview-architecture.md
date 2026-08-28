---
layer: structure
tags: [legal-contracts, lexdraft, architecture, overview]
created: 2026-05-06
links:
  - "[[structure/synthetic-legal-contracts/module-template-engine]]"
  - "[[structure/synthetic-legal-contracts/module-clause-negotiator]]"
  - "[[structure/synthetic-legal-contracts/module-approval-router]]"
  - "[[structure/synthetic-legal-contracts/module-signature-orchestrator]]"
  - "[[structure/synthetic-legal-contracts/module-renewal-monitor]]"
  - "[[structure/synthetic-legal-contracts/module-obligation-tracker]]"
---

# ภาพรวมสถาปัตยกรรม LexDraft — ระบบบริหารวงจรชีวิตสัญญา

LexDraft คือแพลตฟอร์มบริหารวงจรชีวิตสัญญาสำหรับทีมกฎหมายองค์กร ครอบคลุมตั้งแต่ร่างสัญญาจาก template มาตรฐาน การเจรจาต่อรองเงื่อนไข (redline) ระหว่างคู่สัญญา การอนุมัติภายในตามลำดับชั้น การเซ็นสัญญาแบบอิเล็กทรอนิกส์ ไปจนถึงการติดตามพันธะสัญญาหลังลงนามและการแจ้งเตือนต่ออายุ

ทีมวิศวกรรมออกแบบระบบให้แยกความรับผิดชอบชัดเจนระหว่าง 'การร่าง/เจรจา' กับ 'การอนุมัติ/ลงนาม' เพราะสองส่วนนี้มีผู้มีส่วนได้ส่วนเสียต่างกันมาก และความผิดพลาดในขั้นตอนอนุมัติหรือลำดับการเซ็นมีผลทางกฎหมายที่แก้ไขย้อนหลังไม่ได้ ต่างจากการแก้ไขร่างสัญญาที่ยังทำได้ก่อนลงนาม

## Module หลัก

- **template-engine** — จัดการ template สัญญาและ clause library ทั้งหมด รองรับการ versioning เพื่อให้ tr ดู [[structure/synthetic-legal-contracts/module-template-engine]]
- **clause-negotiator** — ติดตามการเจรจาต่อรองเงื่อนไข (redline) ระหว่างองค์กรกับคู่สัญญาภายนอก เก็บทุกรอบ ดู [[structure/synthetic-legal-contracts/module-clause-negotiator]]
- **approval-router** — ตัดสินใจว่าสัญญาฉบับหนึ่งต้องผ่านการอนุมัติจากใครบ้างตามมูลค่าและประเภทสัญญา เป็น service เดียวที่คำนวณ approval chain ทั้งหมด ไม่มี service อื่นคำนวณเส้นทางอนุมัติซ้ำเอง เพื่อไม่ให้เกิดความไม่สอดคล้องกันระหว่างจุดต่างๆ ดู [[structure/synthetic-legal-contracts/module-approval-router]]
- **signature-orchestrator** — ประสานงานลำดับการเซ็นสัญญาแบบอิเล็กทรอนิกส์ระหว่างคู่สัญญาหลายฝ่าย ไม่รู้จักเนื้ ดู [[structure/synthetic-legal-contracts/module-signature-orchestrator]]
- **renewal-monitor** — ตรวจสอบสัญญาที่ใกล้หมดอายุและแจ้งเตือนทีม legal ops ล่วงหน้าตามระยะเวลาที่กำหนด ดู [[structure/synthetic-legal-contracts/module-renewal-monitor]]
- **obligation-tracker** — ติดตามพันธะสัญญาหลังลงนาม เช่น กำหนดส่งมอบงาน เงื่อนไขการชำระ milestone หรือข้อผ ดู [[structure/synthetic-legal-contracts/module-obligation-tracker]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-legal-contracts/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-legal-contracts/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-legal-contracts/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-legal-contracts/database-schema]]
