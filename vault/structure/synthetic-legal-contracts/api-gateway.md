---
layer: structure
tags: [legal-contracts, lexdraft, gateway, api]
created: 2026-02-06
links:
  - "[[structure/synthetic-legal-contracts/module-approval-router]]"
  - "[[business-logic/synthetic-legal-contracts/counterparty-verification-policy]]"
---

# API Gateway

คำขอจากแอปทนายความ/paralegal เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ token และแนบ role ของผู้เรียกไปกับทุก request ก่อนส่งต่อให้ [[structure/synthetic-legal-contracts/module-approval-router]] ตัดสินใจว่าขั้นตอนถัดไปคืออะไร

คำขอจากคู่สัญญาภายนอก (external party) ที่ต้องเซ็นสัญญา ใช้ endpoint แยกที่ไม่ต้อง login เข้าระบบเต็มรูปแบบ แต่ยืนยันตัวตนด้วย token ครั้งเดียวที่ผูกกับ [[business-logic/synthetic-legal-contracts/counterparty-verification-policy]]
