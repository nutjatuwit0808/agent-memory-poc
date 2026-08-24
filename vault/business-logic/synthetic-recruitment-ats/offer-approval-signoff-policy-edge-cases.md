---
layer: business-logic
tags: [offer, edge-case]
created: 2026-06-16
links:
  - "[[business-logic/synthetic-recruitment-ats/offer-approval-signoff-policy]]"
---

# ข้อยกเว้นเมื่อ Approver ที่ต้องเซ็นออกจากบริษัทไปแล้ว

ถ้า approver ที่อยู่ใน approval chain ถูก offboard จากระบบ HR ก่อนที่จะเซ็นอนุมัติ ระบบจะไม่ข้ามขั้นตอนของคนนั้นไปเฉยๆ — ต้อง reroute chain ไปหา approver คนใหม่ที่รับช่วงตำแหน่งเดิมโดยอัตโนมัติผ่าน integration กับระบบ HR ก่อนเสมอ

ถ้าระบบหาผู้รับช่วงอัตโนมัติไม่ได้ (เช่น ตำแหน่งว่างชั่วคราว) offer นั้นจะถูก mark เป็น `approval_blocked` และแจ้ง recruiting ops ให้กำหนด approver ทดแทนด้วยมือ ไม่มีทางที่ offer จะถูกส่งออกไปโดยขาด approver คนใดคนหนึ่งในกรณีนี้เด็ดขาด

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-recruitment-ats/offer-approval-signoff-policy]] ("นโยบายการเซ็นอนุมัติก่อนส่ง Offer") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
