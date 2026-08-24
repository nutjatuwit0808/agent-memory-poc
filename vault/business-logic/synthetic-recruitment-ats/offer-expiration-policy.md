---
layer: business-logic
tags: [offer, expiration, policy]
created: 2025-09-08
---

# นโยบายวันหมดอายุของ Offer

offer letter ที่ส่งออกไปแล้วมีอายุ 7 วันตามค่า default ถ้าผู้สมัครไม่ตอบรับหรือปฏิเสธภายในเวลานี้ ระบบจะเปลี่ยนสถานะเป็น `expired` อัตโนมัติและแจ้ง recruiter

offer ที่ expired ไม่ได้ถูกยกเลิกความหมายถาวร — recruiter สามารถ re-issue offer ใหม่ด้วยเงื่อนไขเดิมหรือปรับใหม่ได้ แต่ต้องผ่าน approval chain ใหม่ทั้งหมดอีกครั้งเสมอ ไม่ใช้ approval เดิมซ้ำ
