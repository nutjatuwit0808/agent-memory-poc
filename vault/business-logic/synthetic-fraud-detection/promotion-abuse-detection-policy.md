---
layer: business-logic
tags: [promo, abuse, policy]
created: 2026-04-24
---

# นโยบายตรวจจับการใช้โปรโมชั่นผิดวัตถุประสงค์

การใช้โปรโมชั่น เช่น referral code หรือ discount voucher เป็น fraud vector ที่พบบ่อย ระบบ ShieldAI ตรวจจับ promo abuse โดยวิเคราะห์ pattern เช่น account ใหม่ที่ redeem promo แล้วไม่มีกิจกรรมหลังจากนั้น, หรือ promo redemption ที่มาจาก device cluster เดียวกันหลายบัญชี

account ที่ถูก flag ว่า promo abuse จะไม่ถูก block ทันที — จะถูกจำกัดสิทธิ์ promo redemption ในอนาคตและส่งเข้า review queue สำหรับ manual decision เพื่อลด false positive กับผู้ใช้จริงที่แชร์ promo กับครอบครัว
