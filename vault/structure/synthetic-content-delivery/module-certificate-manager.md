---
layer: structure
tags: [ssl, certificate, module]
created: 2026-03-12
links:
  - "[[business-logic/synthetic-content-delivery/certificate-renewal-policy]]"
  - "[[deployment/synthetic-content-delivery/monitoring-alerts]]"
  - "[[support-cases/synthetic-content-delivery/case-7822]]"
---

# Module: certificate-manager

จัดการ lifecycle ของ SSL/TLS certificate ทั้งหมดที่ EdgeServe ใช้สำหรับ edge node แต่ละ domain ของ tenant รับผิดชอบตั้งแต่การออก certificate ใหม่ผ่าน ACME protocol, การต่ออายุอัตโนมัติก่อนหมดอายุ, ไปจนถึงการ deploy certificate ใหม่ไปยัง edge node ทุกจุด การต่ออายุต้องเสร็จก่อนหมดอายุอย่างน้อย `CERT_RENEWAL_LEAD_TIME_DAYS` วัน

## ฟังก์ชันหลัก
- `checkExpiryStatus(tenantId: string, domain: string): Promise<CertStatus>` — ตรวจสอบวันหมดอายุของ certificate และคืนสถานะว่าต้อง renew เร็วแค่ไหน
- `initiateRenewal(tenantId: string, domain: string): Promise<RenewalJob>` — เริ่มกระบวนการต่ออายุ certificate ผ่าน ACME คืน job ID สำหรับ tracking
- `deployNewCert(domain: string, cert: CertBundle): Promise<DeploymentResult>` — ติดตั้ง certificate ใหม่ไปยัง edge node ทุกจุดพร้อมกัน ตรวจสอบว่าทุกจุดได้รับแล้ว
- `revokeCompromisedCert(domain: string, reason: string): Promise<void>` — เพิกถอน certificate ที่ถูก compromise ทันทีและเร่ง renew ใหม่ทุก priority

## State

valid → renewal_pending (เมื่อเหลือ n วัน) → renewing → deploying → valid | renewal_failed — ดู [[business-logic/synthetic-content-delivery/certificate-renewal-policy]] สำหรับเงื่อนไขแต่ละ transition

## ความสัมพันธ์กับ module อื่น

หลัง deploy สำเร็จจะ publish event `cert.renewal_succeeded` ให้ service อื่น subscribe — ถ้า deploy ล้มเหลวซ้ำๆ จะ escalate ผ่าน [[deployment/synthetic-content-delivery/monitoring-alerts]] ดู [[support-cases/synthetic-content-delivery/case-7822]] สำหรับกรณีที่ escalation ไม่ทำงานและ certificate หมดอายุจริง
