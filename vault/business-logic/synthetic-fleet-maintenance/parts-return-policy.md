---
layer: business-logic
tags: [parts, return, policy]
created: 2025-11-16
---

# นโยบายการคืนอะไหล่ที่ไม่ได้ใช้

อะไหล่ที่ reserve ไว้สำหรับ work order แต่ไม่ได้ถูกใช้จริงเมื่อ work order ปิด ต้องคืนสต็อกผ่าน `receiveStock` ภายใน `PARTS_RESERVATION_EXPIRY_HOURS` ชั่วโมง ไม่ใช่ปล่อยให้ reservation หมดอายุเอง เพราะ expiry mechanism ไม่ได้บันทึก audit trail

อะไหล่ที่ถูกติดตั้งแล้วถอดออกจากรถ (เช่น อัปเกรดแล้วถอดของเดิมออก) ต้องบันทึก condition ก่อน return เข้า stock เพราะอาจนำ reconditioned parts ไปใช้กับรถคันอื่นได้
