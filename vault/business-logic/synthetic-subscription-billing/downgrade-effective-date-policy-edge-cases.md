---
layer: business-logic
tags: [plan, compliance, edge-case]
created: 2025-09-27
links:
  - "[[business-logic/synthetic-subscription-billing/downgrade-effective-date-policy]]"
---

# ข้อยกเว้นเมื่อ Downgrade เกิดจากการยกเลิกฟีเจอร์ที่ผิดกฎหมาย

ถ้าการ downgrade เกิดจากเหตุผลด้าน compliance (เช่น ฟีเจอร์บางอย่างต้องปิดใช้งานทันทีตามข้อกำหนดทางกฎหมายใหม่) การ downgrade จะมีผลทันทีโดยไม่รอสิ้นสุดรอบบิล และลูกค้าจะได้รับเครดิตคืนตามสัดส่วนที่เหลือของรอบบิลนั้นแทน

การ downgrade แบบทันทีนี้ต้องมีการอนุมัติจากทีม compliance ก่อนเสมอ ไม่ใช่ทีมขายหรือทีมสนับสนุนตัดสินใจเองว่าเป็นกรณี compliance ได้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-subscription-billing/downgrade-effective-date-policy]] ("นโยบายวันที่มีผลของการ Downgrade แพลน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
