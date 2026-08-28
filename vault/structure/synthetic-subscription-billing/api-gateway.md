---
layer: structure
tags: [subscription-billing, recurflow, gateway, api]
created: 2026-02-14
---

# API Gateway

คำขอจาก dashboard ของลูกค้าเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ token และแนบ accountId ไปกับทุก request ก่อนส่งต่อให้ service ที่เกี่ยวข้อง

webhook จาก payment processor ภายนอกที่แจ้งผลการชำระเงิน (สำเร็จ/ล้มเหลว) ใช้ endpoint แยกที่ verify signature ก่อนประมวลผลเสมอ ไม่เชื่อ payload ที่ไม่ผ่านการยืนยันแหล่งที่มา
