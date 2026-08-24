---
layer: business-logic
tags: [audit-trail, integrity, policy]
created: 2026-02-04
links:
  - "[[business-logic/synthetic-document-signing/audit-trail-integrity-policy-edge-cases]]"
---

# นโยบายความสมบูรณ์ของ Audit Trail

ทุก event ใน `audit_events` ต้องมี `prevHash` ที่ตรงกับ `hash` ของ event ก่อนหน้าเสมอ ทำให้การแก้ไข event ใดๆ ย้อนหลังจะทำให้ chain ทั้งหมดหลังจุดนั้นไม่ตรงกันทันทีเมื่อ `verifyChainIntegrity` ตรวจสอบ

ตาราง `audit_events` มี database permission แบบ append-only จริง (ไม่ใช่แค่ convention ในโค้ด) — แม้แต่ทีม engineering เองก็ไม่มีสิทธิ์ UPDATE หรือ DELETE โดยตรงผ่าน production access ปกติ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-document-signing/audit-trail-integrity-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
