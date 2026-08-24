---
layer: business-logic
tags: [cost, policy]
created: 2026-03-18
links:
  - "[[structure/synthetic-analytics-pipeline/module-job-orchestrator]]"
---

# นโยบายแจกแจงต้นทุนการประมวลผลตามทีม

ทุก job ต้องแท็ก `owning_team` ตอนลงทะเบียนใน [[structure/synthetic-analytics-pipeline/module-job-orchestrator]] เสมอ เพื่อให้คำนวณต้นทาง compute และ storage ที่แต่ละทีมใช้ได้ถูกต้องในรายงานต้นทุนรายเดือน

job ที่ไม่มีการแท็ก `owning_team` จะไม่ถูกบล็อกไม่ให้รัน แต่ต้นทุนที่เกิดขึ้นจะถูกจัดเข้ากลุ่ม `unattributed` และทีมแพลตฟอร์มจะติดตามหาเจ้าของย้อนหลังทุกสิ้นเดือน
