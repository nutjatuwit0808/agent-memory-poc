---
layer: structure
tags: [charging, module]
created: 2026-07-26
links:
  - "[[structure/synthetic-warehouse-robotics/module-fleet-controller]]"
  - "[[structure/synthetic-warehouse-robotics/queue-architecture]]"
  - "[[structure/synthetic-warehouse-robotics/module-task-scheduler]]"
  - "[[business-logic/synthetic-warehouse-robotics/charging-priority-policy]]"
---

# Module: charging-station-manager

จัดคิวการชาร์จแบตเตอรี่ให้หุ่นยนต์ทั้งหมด แยกออกมาเป็น service อิสระเพราะการจัดการคิวชาร์จมีข้อจำกัดทางกายภาพ (จำนวนหัวชาร์จจำกัด, กำลังไฟฟ้ารวมของแต่ละโซนจำกัด) ที่ไม่เกี่ยวกับ logic การหยิบสินค้าเลย

## ฟังก์ชันหลัก
- `requestCharging(robotId: string, batteryPct: number): Promise<QueuePosition>` — ขอเข้าคิวชาร์จ คืนตำแหน่งในคิวปัจจุบัน
- `dockRobot(robotId: string, stationId: string): Promise<void>` — สั่งให้หุ่นยนต์เทียบสถานีชาร์จที่กำหนด
- `releaseStation(stationId: string): Promise<void>` — ปลดหุ่นยนต์ออกจากสถานีเมื่อชาร์จเสร็จหรือถูกดึงออกฉุกเฉิน

## ความสัมพันธ์กับ module อื่น

subscribe event `robot.battery_low` จาก [[structure/synthetic-warehouse-robotics/module-fleet-controller]] โดยตรง (ดู [[structure/synthetic-warehouse-robotics/queue-architecture]]) เพื่อไม่ให้การจัดการแบตเตอรี่ต้องพึ่ง [[structure/synthetic-warehouse-robotics/module-task-scheduler]] — ลำดับความสำคัญของการเข้าคิวกำหนดโดย [[business-logic/synthetic-warehouse-robotics/charging-priority-policy]]
