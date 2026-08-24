---
layer: deployment
tags: [model, runbook]
created: 2026-05-29
links:
  - "[[support-cases/synthetic-chat-support-bot/case-4414]]"
  - "[[convention/synthetic-chat-support-bot/testing-convention]]"
---

# Intent Model Rollout Runbook

ขั้นตอนละเอียดสำหรับ rollout โมเดลจำแนก intent เวอร์ชันใหม่ เพื่อป้องกันปัญหาแบบ [[support-cases/synthetic-chat-support-bot/case-4414]] ไม่ให้เกิดซ้ำ

## ก่อน rollout

ต้องเทียบสัดส่วนผลจำแนกแต่ละ label ของโมเดลใหม่กับโมเดลเดิมบน dataset ทดสอบชุดเดียวกันตาม [[convention/synthetic-chat-support-bot/testing-convention]] ก่อนเสมอ

## ระหว่าง canary rollout

เปิดโมเดลใหม่ให้รับ traffic 5% ก่อนเป็นเวลาอย่างน้อย 2 ชั่วโมง เฝ้าดู confidence เฉลี่ยและสัดส่วน handoff เทียบกับกลุ่มที่ยังใช้โมเดลเดิม ถ้าต่างกันเกิน threshold ให้หยุดขยาย rollout ทันที
