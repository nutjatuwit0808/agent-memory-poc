---
layer: business-logic
tags: [credential, security, channel, policy]
created: 2026-06-25
links:
  - "[[structure/synthetic-customer-segmentation/module-channel-exporter]]"
  - "[[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]"
---

# นโยบายการ Rotate Credential ของ Marketing Channel

API credential ของทุก marketing channel ต้อง rotate ทุก 90 วัน — [[structure/synthetic-customer-segmentation/module-channel-exporter]] มี credential store แยกต่างหากที่เข้ารหัส และทีม IT ต้องอัปเดต credential ใหม่ก่อน credential เก่าหมดอายุอย่างน้อย 7 วัน

ถ้า credential expired และ export ล้มเหลว on-call engineer ต้อง rotate ก่อน retry — ตาม [[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]] การ retry โดยไม่แก้ credential จะเปลืองโควต้า API และอาจทำให้ channel ban IP ได้
