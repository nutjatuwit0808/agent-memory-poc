---
layer: structure
tags: [quality-control, qualitypulse, boundaries]
created: 2026-02-10
links:
  - "[[structure/synthetic-quality-control/module-measurement-collector]]"
  - "[[structure/synthetic-quality-control/module-spc-analyzer]]"
  - "[[structure/synthetic-quality-control/module-batch-inspector]]"
---

# Service Boundaries

แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — [[structure/synthetic-quality-control/module-measurement-collector]] เป็นเจ้าของข้อมูลวัดดิบทั้งหมด ส่วน [[structure/synthetic-quality-control/module-spc-analyzer]] ดึงข้อมูลมาคำนวณแต่ไม่เก็บ raw measurement ซ้ำ ผล SPC ที่ spc-analyzer สร้างขึ้นเป็นของตัวเองคนเดียว

[[structure/synthetic-quality-control/module-batch-inspector]] เป็น service เดียวที่อ่านผล SPC แล้วตัดสินใจว่า batch ผ่านหรือไม่ผ่าน เหตุผลที่รวมการตัดสินใจไว้ที่จุดเดียวคือเพื่อป้องกัน race condition ที่อาจเกิดขึ้นถ้าปล่อยให้หลาย service ตัดสินใจพร้อมกันสำหรับ batch เดียวกัน
