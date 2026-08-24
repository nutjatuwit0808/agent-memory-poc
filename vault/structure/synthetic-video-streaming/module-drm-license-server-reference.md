---
layer: structure
tags: [drm, module, core, reference, identifiers]
created: 2026-08-08
links:
  - "[[structure/synthetic-video-streaming/module-drm-license-server]]"
  - "[[business-logic/synthetic-video-streaming/drm-license-issuance-policy]]"
---

# drm-license-server — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด drm-license-server สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-video-streaming/module-drm-license-server]])

## Public functions
- `issueLicense(deviceId: string, contentId: string, policy: LicensePolicy): Promise<LicenseResponse>` — ออก license ใหม่หลังยืนยัน device certificate และตรวจสิทธิ์ตาม policy
- `revokeLicense(licenseId: string): Promise<void>` — เพิกถอน license ก่อนหมดอายุ เช่นเมื่อ account ถูกระงับ
- `validateDeviceCertificate(deviceId: string): Promise<boolean>` — ตรวจว่า certificate ของอุปกรณ์ยังไม่หมดอายุและไม่อยู่ใน revoke list

## Internal constants
- `LICENSE_TTL_SEC = 21600`
- `MAX_CONCURRENT_STREAMS_PER_ACCOUNT = 4`

## Type

```ts
interface LicenseResponse {
  licenseId: string;
  status: "issued" | "denied";
  denyReason?: "cert_invalid" | "concurrent_limit" | "content_restricted";
  expiresAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องเงื่อนไขการออก license ที่ [[business-logic/synthetic-video-streaming/drm-license-issuance-policy]]
