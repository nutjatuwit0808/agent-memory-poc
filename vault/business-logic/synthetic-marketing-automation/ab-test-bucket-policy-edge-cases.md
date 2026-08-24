---
layer: business-logic
tags: [ab-test, edge-case]
created: 2026-04-25
links:
  - "[[business-logic/synthetic-marketing-automation/ab-test-bucket-policy]]"
---

# ข้อยกเว้นเมื่อ Segment มีขนาดเล็กเกินไปสำหรับ A/B Test

segment ที่มีสมาชิกน้อยกว่า 1,000 contact ไม่อนุญาตให้เปิด A/B test เลย — ระบบจะปฏิเสธตั้งแต่ตอน `validateCampaign` เพราะขนาดตัวอย่างเล็กเกินกว่าจะได้ผลลัพธ์ที่มีนัยสำคัญทางสถิติ

ถ้าทีม marketing ยืนยันต้องการทดสอบกับ segment เล็กจริงๆ (เช่น กลุ่มลูกค้า VIP เฉพาะ) ต้องขอ override ผ่านช่องทาง manual approval แยกต่างหาก ไม่ใช่ตั้งค่าผ่าน UI ปกติ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-marketing-automation/ab-test-bucket-policy]] ("นโยบายการแบ่ง Bucket สำหรับ A/B Test") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
