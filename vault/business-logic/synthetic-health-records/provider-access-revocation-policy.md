---
layer: business-logic
tags: [access-control, policy]
created: 2026-03-07
links:
  - "[[structure/synthetic-health-records/module-provider-access-control]]"
  - "[[business-logic/synthetic-health-records/provider-access-revocation-policy-edge-cases]]"
---

# นโยบายการเพิกถอนสิทธิ์ Provider

เมื่อความสัมพันธ์การรักษาสิ้นสุด (ผู้ป่วยย้ายแพทย์, แพทย์ลาออก) สิทธิ์การเข้าถึงต้องถูกเพิกถอนทันทีผ่าน `revokeAccess` ไม่รอให้หมดอายุตามรอบปกติ

การเพิกถอนสิทธิ์ publish event `provider.access_revoked` ทันที ให้ [[structure/synthetic-health-records/module-provider-access-control]] ล้าง cache ทุก instance ภายในไม่กี่วินาที

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-health-records/provider-access-revocation-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
