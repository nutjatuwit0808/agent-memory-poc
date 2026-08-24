---
layer: deployment
tags: [firmware, runbook]
created: 2026-01-09
links:
  - "[[business-logic/synthetic-warehouse-robotics/firmware-rollout-policy]]"
  - "[[convention/synthetic-warehouse-robotics/testing-convention]]"
---

# Fleet Firmware Deployment Runbook

ขั้นตอนละเอียดสำหรับ rollout firmware ตามที่กำหนดไว้ใน [[business-logic/synthetic-warehouse-robotics/firmware-rollout-policy]]

## ก่อน rollout

ต้องผ่าน simulation test ครบตาม [[convention/synthetic-warehouse-robotics/testing-convention]] และเลือกหุ่นยนต์กลุ่มแรกจากโซนที่ไม่ใช่ peak zone เท่านั้น

## ระหว่างเฝ้าระวัง 24 ชั่วโมง

เฝ้าดู fault rate, pick success rate, และ battery consumption ของกลุ่มที่อัปเดตเทียบกับกลุ่มที่ยังไม่อัปเดต ถ้าตัวเลขต่างกันเกิน 5% ให้หยุดขยาย rollout ทันที
