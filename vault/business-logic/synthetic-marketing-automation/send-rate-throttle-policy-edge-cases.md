---
layer: business-logic
tags: [send, throttle, edge-case]
created: 2025-10-16
links:
  - "[[structure/synthetic-marketing-automation/module-deliverability-monitor]]"
  - "[[business-logic/synthetic-marketing-automation/send-rate-throttle-policy]]"
---

# ข้อยกเว้นเมื่อ Backlog สะสมจากการ Pause กลาง Batch

ถ้า job ถูก `pauseSendJob` กลางทางจาก [[structure/synthetic-marketing-automation/module-deliverability-monitor]] แล้วกลับมาส่งต่อ ระบบจะไม่เร่งอัตราส่งเพื่อ "ไล่ตาม" เวลาที่เสียไป — ยังคงส่งตาม rate limit ปกติเพื่อไม่ให้ metric ที่ทำให้ pause แต่แรกแย่ลงไปอีก

campaign ที่ผู้รับส่วนใหญ่เป็นลูกค้า tier สูง (`vip` segment) ได้รับสิทธิ์ priority queue แยกที่ไม่ต้องรอ backlog ของ campaign อื่นที่คิวอยู่ก่อน แต่ยังอยู่ภายใต้ rate limit เดียวกันเสมอ ไม่มีข้อยกเว้นเรื่อง rate

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-marketing-automation/send-rate-throttle-policy]] ("นโยบาย Throttle อัตราการส่ง") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
