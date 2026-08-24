---
layer: structure
tags: [document-signing, signflow, architecture, overview]
created: 2026-07-18
links:
  - "[[structure/synthetic-document-signing/module-envelope-builder]]"
  - "[[structure/synthetic-document-signing/module-signature-capture]]"
  - "[[structure/synthetic-document-signing/module-audit-trail-logger]]"
  - "[[structure/synthetic-document-signing/module-template-manager]]"
  - "[[structure/synthetic-document-signing/module-notary-integration]]"
  - "[[structure/synthetic-document-signing/module-reminder-scheduler]]"
---

# ภาพรวมสถาปัตยกรรม SignFlow — แพลตฟอร์มเซ็นเอกสารอิเล็กทรอนิกส์

SignFlow คือแพลตฟอร์มเซ็นเอกสารอิเล็กทรอนิกส์ (e-signature) สำหรับสัญญาธุรกิจ ตั้งแต่การประกอบเอกสาร กำหนดลำดับผู้เซ็น จับลายเซ็นจริง ไปจนถึงเก็บ audit trail ที่ใช้อ้างอิงทางกฎหมายได้ ลูกค้าส่วนใหญ่เป็นทีมกฎหมายและฝ่ายจัดซื้อขององค์กรที่ต้องการเอกสารที่พิสูจน์ได้ว่าใครเซ็นอะไรตอนไหน ไม่ใช่แค่ไฟล์ PDF ที่มีลายเซ็นแปะอยู่

ระบบแบ่งเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่ประกอบ envelope (เอกสาร + field ผู้เซ็น) จับลายเซ็นจริง บันทึก audit trail แบบ hash-chain ไปจนถึงเชื่อมต่อผู้รับรองเอกสาร (notary) ภายนอกสำหรับเอกสารบางประเภทที่กฎหมายกำหนด ทีมวิศวกรรมถือว่า audit trail เป็นหัวใจของระบบมากกว่าตัว UI เซ็นเอกสารเสียอีก เพราะถ้า audit trail พิสูจน์ไม่ได้ว่าใครเซ็นจริง สัญญาทั้งฉบับก็ไร้ความหมายทางกฎหมาย

## Module หลัก

- **envelope-builder** — ประกอบเอกสาร + field ผู้เซ็น + ลำดับการเซ็นให้เป็น "envelope" หนึ่งชุดพร้อมส่งให้เซ็น แยกออกมาจาก "contract-service" ก้อนเดียวตั้งแต่ปลายปี 2024 เพราะ logic การจัดวาง field และลำดับผู้เซ็นซับซ้อนขึ้นเรื่อยๆ ดู [[structure/synthetic-document-signing/module-envelope-builder]]
- **signature-capture** — จับลายเซ็นจริง (วาดด้วยนิ้ว/เมาส์, พิมพ์ชื่อ, หรือ click-to-sign) และเป็นจุดเดีย ดู [[structure/synthetic-document-signing/module-signature-capture]]
- **audit-trail-logger** — บันทึกทุกเหตุการณ์ที่เกิดกับ envelope แบบ append-only และ hash-chain (แต่ละ even ดู [[structure/synthetic-document-signing/module-audit-trail-logger]]
- **template-manager** — จัดการเทมเพลตสัญญาที่ reuse ได้ พร้อม merge field (เช่น `{{customer_name}}`) ที่ ดู [[structure/synthetic-document-signing/module-template-manager]]
- **notary-integration** — เชื่อมต่อกับผู้ให้บริการรับรองเอกสารออนไลน์ (remote online notary) ภายนอกสำหรับเ ดู [[structure/synthetic-document-signing/module-notary-integration]]
- **reminder-scheduler** — ส่งอีเมล/SMS เตือน signer ที่ยังไม่ถึงตาเซ็นหรือถึงตาแล้วแต่ยังไม่ดำเนินการ ตามต ดู [[structure/synthetic-document-signing/module-reminder-scheduler]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-document-signing/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-document-signing/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-document-signing/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-document-signing/database-schema]]
