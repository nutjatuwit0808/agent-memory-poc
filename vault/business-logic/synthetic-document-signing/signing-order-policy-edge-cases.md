---
layer: business-logic
tags: [signing-order, edge-case]
created: 2026-01-06
links:
  - "[[business-logic/synthetic-document-signing/delegate-signing-policy]]"
  - "[[business-logic/synthetic-document-signing/signing-order-policy]]"
---

# ข้อยกเว้นของลำดับการเซ็นเมื่อมี Signer ถูกข้าม (Skip) หรือ Delegate

ถ้า signer ในลำดับถูกตั้งเป็น `optional` (เช่น ผู้รับทราบที่ไม่จำเป็นต้องเซ็นจริง) ระบบจะข้ามไปให้ signer ลำดับถัดไปเซ็นได้ทันทีโดยไม่ต้องรอ ไม่ต่างจากกรณีปกติที่ signer คนนั้นเซ็นแล้ว — สถานะของ signer ที่ถูกข้ามจะบันทึกเป็น `skipped` ไม่ใช่ `signed`

การ delegate สิทธิ์เซ็นให้คนอื่น (ดู [[business-logic/synthetic-document-signing/delegate-signing-policy]]) ไม่เปลี่ยนลำดับเดิม — คน delegate ใหม่เข้ามาแทนตำแหน่งเดิมในลำดับเป๊ะๆ ไม่ใช่การเพิ่ม signer ใหม่ต่อท้าย เพื่อไม่ให้ audit trail สับสนว่าใครควรเซ็นตอนไหน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-document-signing/signing-order-policy]] ("นโยบายลำดับการเซ็นเอกสาร (Signing Order)") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
