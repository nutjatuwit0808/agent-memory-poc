---
layer: structure
tags: [document-signing, signflow, queue, async]
created: 2025-12-07
links:
  - "[[structure/synthetic-document-signing/module-reminder-scheduler]]"
  - "[[structure/synthetic-document-signing/module-audit-trail-logger]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `envelope.sent`, `signer.completed`, `envelope.completed`, `envelope.voided`, `notary.session_completed` — [[structure/synthetic-document-signing/module-reminder-scheduler]] subscribe `envelope.sent` เพื่อตั้งตารางเตือนล่วงหน้า และ subscribe `signer.completed` เพื่อยกเลิกเตือนของ signer คนนั้นทันที

[[structure/synthetic-document-signing/module-audit-trail-logger]] subscribe แทบทุก event ในระบบเพื่อบันทึกเป็น audit event เสมอ แต่ไม่ publish event ของตัวเองกลับเข้า queue เลย เพราะออกแบบให้เป็น "ปลายทางบันทึก" ทางเดียว ไม่ใช่ node ที่ trigger logic อื่นต่อ เพื่อไม่ให้ audit trail กลายเป็นจุดที่ business logic อื่นมาพึ่งพา
