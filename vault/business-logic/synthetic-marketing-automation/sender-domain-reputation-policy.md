---
layer: business-logic
tags: [deliverability, domain, policy]
created: 2026-08-13
---

# นโยบายดูแล Sender Domain Reputation

sending domain ใหม่ต้องผ่านช่วง warm-up (ส่งในปริมาณน้อยแล้วค่อยๆ เพิ่มตลอด 4 สัปดาห์) ก่อนใช้ส่ง campaign เต็มปริมาณ — ห้ามใช้ domain ใหม่ส่ง campaign ขนาดใหญ่ทันทีแม้จะมี segment พร้อมแล้วก็ตาม

การ migrate ไปใช้ sending domain ใหม่ (เช่น เปลี่ยน ESP) ต้องรัน parallel กับ domain เดิมอย่างน้อย 2 สัปดาห์ก่อนตัด domain เดิมทิ้งเสมอ
