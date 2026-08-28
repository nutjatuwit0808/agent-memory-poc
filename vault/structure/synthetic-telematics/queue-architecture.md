---
layer: structure
tags: [telematics, drivelog, queue, async]
created: 2026-01-13
links:
  - "[[structure/synthetic-telematics/module-driving-scorer]]"
  - "[[structure/synthetic-telematics/module-accident-detector]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `trip.completed`, `harsh_event.detected`, `score.recalculated`, `accident.suspected`, `device.heartbeat_missed` — [[structure/synthetic-telematics/module-driving-scorer]] subscribe `trip.completed` เพื่อคำนวณคะแนนใหม่ทุกครั้งที่เที่ยวการเดินทางหนึ่งจบลง

[[structure/synthetic-telematics/module-accident-detector]] subscribe `harsh_event.detected` แบบ real-time เพื่อประเมินว่าเหตุการณ์นั้นมีแนวโน้มเป็นอุบัติเหตุจริงหรือไม่ทันที ไม่รอประมวลผลแบบ batch
