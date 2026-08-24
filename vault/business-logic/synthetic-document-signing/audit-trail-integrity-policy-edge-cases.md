---
layer: business-logic
tags: [audit-trail, edge-case]
created: 2025-09-14
links:
  - "[[business-logic/synthetic-document-signing/audit-trail-integrity-policy]]"
---

# ข้อยกเว้นเมื่อพบ Chain ขาดจากปัญหาทางเทคนิค (ไม่ใช่การปลอมแปลง)

ถ้า `verifyChainIntegrity` พบว่า chain ขาดเพราะปัญหาทางเทคนิค (เช่น event สูญหายจาก infrastructure failure ที่พิสูจน์ได้จาก log อื่น ไม่ใช่การปลอมแปลง) ระบบจะไม่พยายาม "ซ่อม" chain เดิมเด็ดขาด — จะสร้าง event พิเศษ `chain_gap_documented` ต่อท้าย chain ที่อธิบายช่องว่างและอ้างอิงหลักฐานประกอบแทน เพื่อรักษาความจริงที่ว่า chain นี้เคยขาดจริง

envelope ที่มี `chain_gap_documented` ต้องแนบ postmortem หรือหลักฐานสนับสนุนเสมอเมื่อใช้เป็นหลักฐานทางกฎหมาย ทีมกฎหมายของลูกค้าต้องได้รับแจ้งก่อนใช้เอกสารกลุ่มนี้ในการดำเนินคดีหรือข้อพิพาทใดๆ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-document-signing/audit-trail-integrity-policy]] ("นโยบายความสมบูรณ์ของ Audit Trail") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
