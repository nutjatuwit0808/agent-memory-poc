---
layer: structure
tags: [drm, module, core]
created: 2025-11-24
links:
  - "[[structure/synthetic-video-streaming/module-cdn-origin-shield]]"
  - "[[business-logic/synthetic-video-streaming/drm-license-issuance-policy]]"
---

# Module: drm-license-server

ออก license ให้ผู้เล่นวิดีโอที่ผ่านการยืนยันตัวตนแล้วสามารถถอดรหัสคอนเทนต์ที่ป้องกันด้วย DRM ได้ แยกออกมาเป็น service เดี่ยวเพราะข้อกำหนดด้าน compliance กับผู้ให้บริการ DRM ภายนอกต้องการ audit log แยกและสิทธิ์เข้าถึงจำกัดเฉพาะทีมที่ผ่านการอบรม

## ฟังก์ชันหลัก
- `issueLicense(deviceId: string, contentId: string, policy: LicensePolicy): Promise<LicenseResponse>` — ออก license ใหม่หลังยืนยัน device certificate และตรวจสิทธิ์ตาม policy
- `revokeLicense(licenseId: string): Promise<void>` — เพิกถอน license ก่อนหมดอายุ เช่นเมื่อ account ถูกระงับ
- `validateDeviceCertificate(deviceId: string): Promise<boolean>` — ตรวจว่า certificate ของอุปกรณ์ยังไม่หมดอายุและไม่อยู่ใน revoke list

## State

requested → certificate_validated → issued → active → expired | revoked

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-video-streaming/module-cdn-origin-shield]] เป็นตัวเดียวที่เรียก `issueLicense` แทนผู้เล่นโดยตรง เพื่อรวมจุดตรวจสอบ concurrent stream cap ไว้ที่เดียว ดู [[business-logic/synthetic-video-streaming/drm-license-issuance-policy]]
