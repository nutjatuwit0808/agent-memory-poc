---
layer: structure
tags: [ssl, certificate, module, reference, identifiers]
created: 2026-03-02
links:
  - "[[structure/synthetic-content-delivery/module-certificate-manager]]"
  - "[[business-logic/synthetic-content-delivery/certificate-renewal-policy]]"
---

# certificate-manager — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด certificate-manager สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-content-delivery/module-certificate-manager]])

## Public functions
- `checkExpiryStatus(tenantId: string, domain: string): Promise<CertStatus>` — ตรวจสอบวันหมดอายุของ certificate และคืนสถานะว่าต้อง renew เร็วแค่ไหน
- `initiateRenewal(tenantId: string, domain: string): Promise<RenewalJob>` — เริ่มกระบวนการต่ออายุ certificate ผ่าน ACME คืน job ID สำหรับ tracking
- `deployNewCert(domain: string, cert: CertBundle): Promise<DeploymentResult>` — ติดตั้ง certificate ใหม่ไปยัง edge node ทุกจุดพร้อมกัน ตรวจสอบว่าทุกจุดได้รับแล้ว
- `revokeCompromisedCert(domain: string, reason: string): Promise<void>` — เพิกถอน certificate ที่ถูก compromise ทันทีและเร่ง renew ใหม่ทุก priority

## Internal constants
- `CERT_RENEWAL_LEAD_TIME_DAYS = 30`
- `CERT_CRITICAL_THRESHOLD_DAYS = 7`
- `ACME_CHALLENGE_TIMEOUT_SECONDS = 120`

## Type

```ts
interface CertStatus {
  domain: string;
  tenantId: string;
  expiresAt: Date;
  daysRemaining: number;
  renewalStatus: "not_needed" | "renewal_pending" | "renewing" | "renewal_failed";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง lead time และ escalation ที่ [[business-logic/synthetic-content-delivery/certificate-renewal-policy]]
