---
layer: deployment
tags: [migration, runbook, storage]
created: 2026-02-27
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
---

# Storage Tier Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อ asset ไม่ถูกเข้าถึงเกิน 90 วัน จะถูกย้ายจาก storage tier แบบ hot ไป cold เพื่อลดค่าใช้จ่าย ต้อง migrate mapping ที่ [[structure/synthetic-video-streaming/module-transcode-worker]] ดูแลให้ตรงกับ path ใหม่เสมอ

## ขั้นตอน

1) mark asset เป็น `migrating` ชั่วคราว (คำขอเล่นระหว่างนี้ fallback ไปดึงจาก tier เดิมก่อน) 2) copy ไฟล์ไป tier ใหม่ 3) verify checksum ตรงกัน 4) อัปเดต path ใน `renditions` แล้วลบไฟล์จาก tier เดิม
