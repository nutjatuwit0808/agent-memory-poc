---
layer: business-logic
tags: [envelope, void, policy]
created: 2025-09-02
---

# นโยบายการยกเลิก Envelope (Void)

envelope ที่ยังไม่มีใครเซ็นเลยสามารถ void ได้ทันทีโดยผู้สร้างคนเดียว แต่ envelope ที่มี signer เซ็นไปแล้วอย่างน้อย 1 คน ต้องระบุเหตุผลการ void และบันทึกเป็น audit event เสมอ เพราะกระทบสิทธิ์ของคนที่เซ็นไปแล้ว

envelope ที่ void แล้วไม่สามารถกลับมาเซ็นต่อได้อีก แม้จะยังไม่หมดอายุตามปกติก็ตาม ต้องสร้าง envelope ใหม่เสมอ
