---
layer: convention
tags: [naming, style]
created: 2026-05-09
---

# Naming Convention

## ตัวแปรและฟังก์ชัน

`camelCase` เช่น `advanceStage`, `computeConfidenceScore` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย

## Identifier หลัก

`candidateId` และ `requisitionId` เป็น UUID เสมอ ไม่ใช้เลขรันนิ่งที่เดาลำดับได้ เพื่อป้องกันการเดา id ของผู้สมัครคนอื่นจาก URL
