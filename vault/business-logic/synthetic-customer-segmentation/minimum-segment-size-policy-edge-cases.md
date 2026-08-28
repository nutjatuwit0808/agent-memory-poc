---
layer: business-logic
tags: [segment-size, testing, edge-case]
created: 2025-11-13
links:
  - "[[business-logic/synthetic-customer-segmentation/minimum-segment-size-policy]]"
---

# ข้อยกเว้น: Segment ขนาดเล็กสำหรับ Internal Testing

segment ที่ถูก tag ว่า `internal_test` ได้รับยกเว้นจาก minimum size rule และสามารถ export ไปยัง channel ที่ mark ว่า `test_channel` เท่านั้น — ไม่สามารถ export ไปยัง production channel แม้จะ tag เป็น internal_test ก็ตาม

การ tag `internal_test` ต้องทำโดย admin เท่านั้น ไม่ใช่ self-service ของทีม marketing ทั่วไป เพื่อป้องกันการ bypass minimum size rule โดยไม่ตั้งใจ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-customer-segmentation/minimum-segment-size-policy]] ("นโยบาย Minimum Segment Size ก่อน Export") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
