---
layer: structure
tags: [warehouse-robotics, warebot, queue, async]
created: 2025-09-19
links:
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
  - "[[structure/synthetic-warehouse-robotics/module-charging-station-manager]]"
---

# Queue Architecture

Event หลักที่ไหลผ่าน message queue คือ `pick.assigned`, `pick.completed`, `pick.failed`, `robot.fault_detected`, `robot.battery_low` — [[structure/synthetic-warehouse-robotics/module-task-scheduler]] เป็นทั้งผู้ publish และ subscribe เพราะต้อง react ต่อผลลัพธ์ของ task ที่ตัวเองสั่งไป

[[structure/synthetic-warehouse-robotics/module-charging-station-manager]] subscribe `robot.battery_low` เพื่อดันหุ่นยนต์เข้าคิวชาร์จอัตโนมัติ โดยไม่ต้องรอให้ task-scheduler สั่งงานตรงๆ ออกแบบแบบนี้เพื่อให้การจัดการแบตเตอรี่ไม่ผูกกับ task queue หลัก ถ้า task-scheduler ล่ม หุ่นยนต์ยังเข้าคิวชาร์จเองได้ตามปกติ
