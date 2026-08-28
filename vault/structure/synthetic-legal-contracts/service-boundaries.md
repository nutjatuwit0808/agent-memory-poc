---
layer: structure
tags: [legal-contracts, lexdraft, boundaries]
created: 2026-02-26
links:
  - "[[structure/synthetic-legal-contracts/module-template-engine]]"
  - "[[structure/synthetic-legal-contracts/module-clause-negotiator]]"
  - "[[structure/synthetic-legal-contracts/module-signature-orchestrator]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-legal-contracts/module-template-engine]] เป็นเจ้าของ template และ clause library ทั้งหมด ส่วน [[structure/synthetic-legal-contracts/module-clause-negotiator]] เก็บแค่ประวัติการเจรจา (redline history) ของสัญญาแต่ละฉบับ ไม่แตะ template ต้นทาง

[[structure/synthetic-legal-contracts/module-signature-orchestrator]] ไม่รู้จักเนื้อหาสัญญาเลย รู้แค่ลำดับผู้เซ็นและสถานะการเซ็นแต่ละคน — การแยกแบบนี้ทำให้เปลี่ยน e-signature provider ได้โดยไม่กระทบ business logic ส่วนอื่น
