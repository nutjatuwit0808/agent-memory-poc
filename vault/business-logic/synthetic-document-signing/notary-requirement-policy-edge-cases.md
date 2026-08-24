---
layer: business-logic
tags: [notary, edge-case]
created: 2026-08-02
links:
  - "[[business-logic/synthetic-document-signing/notary-requirement-policy]]"
---

# ข้อยกเว้นเมื่อ Notary Session ล้มเหลวซ้ำหลายครั้ง

ถ้า `retryNotarySession` ล้มเหลวติดต่อกันเกิน 3 ครั้งภายใน 24 ชั่วโมง (มักเกิดจาก notary provider มีปัญหาฝั่งเขา) ระบบจะไม่ retry อัตโนมัติต่ออีก แต่แจ้งทีม support ให้ประสานงานกับ provider หรือเสนอ provider สำรองให้ลูกค้าเลือกแทน เพื่อไม่ให้ envelope ค้างสถานะ `pending_notarization` ไม่จำกัดเวลาโดยไม่มีใครรู้

เอกสารที่ notarization ล้มเหลวจริงและลูกค้าต้องการยกเลิก ต้อง void envelope ทั้งฉบับแล้วเริ่มใหม่ ห้ามพยายามข้ามขั้นตอน notary แล้ว mark เป็น completed เองเด็ดขาด เพราะจะทำให้เอกสารไม่มีผลทางกฎหมายตามที่ตั้งใจไว้ตั้งแต่ต้น

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-document-signing/notary-requirement-policy]] ("นโยบายการกำหนดเอกสารที่ต้องผ่าน Notary") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
