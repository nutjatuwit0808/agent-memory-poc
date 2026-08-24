---
layer: structure
tags: [document-signing, signflow, boundaries]
created: 2025-12-15
links:
  - "[[structure/synthetic-document-signing/module-envelope-builder]]"
  - "[[structure/synthetic-document-signing/module-audit-trail-logger]]"
  - "[[structure/synthetic-document-signing/module-signature-capture]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-document-signing/module-envelope-builder]] เป็นเจ้าของโครงสร้าง envelope (เอกสาร, signer, field, ลำดับการเซ็น) ทั้งหมด ส่วน [[structure/synthetic-document-signing/module-audit-trail-logger]] เป็นเจ้าของ log เหตุการณ์เท่านั้น ไม่รู้จักโครงสร้างของ field หรือเนื้อหาเอกสารเลย รู้แค่ว่า "เหตุการณ์อะไรเกิดกับ envelope ไหนตอนไหน"

[[structure/synthetic-document-signing/module-signature-capture]] เป็น service เดียวที่ query ทั้งโครงสร้าง envelope จาก [[structure/synthetic-document-signing/module-envelope-builder]] และเขียน event เข้า [[structure/synthetic-document-signing/module-audit-trail-logger]] พร้อมกันในทุก transaction เดียว — เหตุผลที่ยอมให้ query ข้าม service แบบนี้ (ผิดหลักทั่วไป) คือการยืนยันว่าผู้เซ็นถึงตาจริงหรือไม่ กับการบันทึกเหตุการณ์เซ็นต้องเกิดเป็น atomic operation เดียวกัน ไม่งั้นจะเกิดช่องว่างที่มีคนเซ็นได้แต่ audit trail ไม่ทันบันทึก
