---
layer: business-logic
tags: [provisioning, edge-case]
created: 2025-09-18
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/device-reassignment-policy]]"
---

# ข้อยกเว้นเมื่อย้ายอุปกรณ์ระหว่างรถกำลังมีทริปค้าง

ถ้ารถคันเดิมมีทริปที่ยัง `in_progress` อยู่ตอนขอ `reassignDevice` ระบบจะไม่ปฏิเสธ request ทันที แต่จะบังคับปิดทริปนั้นด้วยตำแหน่งล่าสุดที่ทราบก่อนเสมอ (เหมือนเป็นการปิดทริปแบบ force-close) แทนที่จะปล่อยให้ทริปค้างสถานะ in_progress ตลอดไปโดยไม่มีอุปกรณ์รายงานตำแหน่งต่อ

อุปกรณ์ที่เพิ่งถูก reassign จะเข้าเงื่อนไข `REASSIGNMENT_COOLDOWN_HOURS` ก่อนถึงจะย้ายซ้ำได้อีกครั้ง เพื่อป้องกันความผิดพลาดจากการกดย้ายซ้ำเร็วเกินไปโดยไม่ตั้งใจของทีม support

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-iot-fleet-tracker/device-reassignment-policy]] ("นโยบายการย้ายอุปกรณ์ข้ามยานพาหนะ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
