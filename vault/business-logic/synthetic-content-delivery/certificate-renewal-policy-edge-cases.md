---
layer: business-logic
tags: [ssl, certificate, manual-renewal, edge-case]
created: 2025-09-30
links:
  - "[[business-logic/synthetic-content-delivery/certificate-renewal-policy]]"
---

# ข้อยกเว้น: Certificate ที่ออกโดย CA ภายนอกและไม่รองรับ Auto-Renewal

Tenant บางรายมี certificate ที่ออกโดย CA ของตัวเองหรือ CA ที่ไม่รองรับ ACME protocol — กรณีนี้ tenant ต้องอัปโหลด certificate ใหม่ผ่าน portal ด้วยมือ และ certificate-manager จะแจ้งเตือนล่วงหน้าตาม `CERT_RENEWAL_LEAD_TIME_DAYS` เหมือนกัน แต่จะไม่เริ่ม renewal process อัตโนมัติ

หาก tenant ไม่ดำเนินการภายในกำหนด certificate-manager จะยกระดับ alert ทุก 24 ชั่วโมงและสุดท้ายจะแจ้งทีม account management ให้ติดต่อ tenant โดยตรง — ห้ามต่ออายุแทน tenant โดยไม่ได้รับการยืนยันเป็นลายลักษณ์อักษรเพราะ certificate เกี่ยวข้องกับ identity ของ tenant

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-content-delivery/certificate-renewal-policy]] ("นโยบาย Certificate Renewal Lead Time") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
