---
layer: deployment
tags: [ssl, certificate, runbook]
created: 2026-07-28
links:
  - "[[business-logic/synthetic-content-delivery/certificate-renewal-policy]]"
  - "[[deployment/synthetic-content-delivery/monitoring-alerts]]"
  - "[[support-cases/synthetic-content-delivery/case-7822]]"
---

# Certificate Rotation Runbook

ขั้นตอนสำหรับ rotate certificate ทั้งแบบ planned renewal ตาม schedule และแบบ emergency rotation กรณี certificate ถูก compromise — ดู [[business-logic/synthetic-content-delivery/certificate-renewal-policy]] สำหรับ policy ที่บังคับ

## Planned renewal

กระบวนการ auto-renewal ผ่าน ACME ดำเนินการอัตโนมัติ ทีมต้องตรวจสอบว่า consumer ของ `cert.renewal_due` ทำงานปกติโดยดูจาก [[deployment/synthetic-content-delivery/monitoring-alerts]] หลัง [[support-cases/synthetic-content-delivery/case-7822]] เพิ่ม alert สำหรับ consumer lag

## Emergency rotation

1) Revoke certificate ที่ถูก compromise ผ่าน `revokeCompromisedCert` 2) กระบวนการ renewal จะถูก trigger อัตโนมัติด้วย priority สูงสุด 3) Monitor propagation ทุก 5 นาที 4) ยืนยันด้วย TLS handshake จริงกับ edge node ทุกจุด
