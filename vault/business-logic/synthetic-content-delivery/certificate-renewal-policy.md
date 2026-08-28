---
layer: business-logic
tags: [ssl, certificate, renewal, policy]
created: 2025-12-14
links:
  - "[[structure/synthetic-content-delivery/module-certificate-manager]]"
  - "[[business-logic/synthetic-content-delivery/certificate-renewal-policy-edge-cases]]"
---

# นโยบาย Certificate Renewal Lead Time

[[structure/synthetic-content-delivery/module-certificate-manager]] ต้องเริ่มกระบวนการต่ออายุ certificate ก่อนหมดอายุอย่างน้อย `CERT_RENEWAL_LEAD_TIME_DAYS` วัน (ค่าเริ่มต้น 30 วัน) เพื่อให้มีเวลา retry กรณี ACME challenge ล้มเหลว หรือกรณีที่ต้องแก้ DNS record ด้วยมือก่อน

เมื่อเหลือน้อยกว่า `CERT_CRITICAL_THRESHOLD_DAYS` วัน (ค่าเริ่มต้น 7 วัน) และยังไม่มี certificate ใหม่ที่ valid จะ trigger alert ด่วนไปยังทีม on-call ทันที ไม่รอ digest รายชั่วโมง เพราะหาก certificate หมดอายุจะทำให้ edge node ทั้งหมดของ domain นั้นใช้งานไม่ได้ทันที

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-content-delivery/certificate-renewal-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
