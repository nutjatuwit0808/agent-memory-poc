---
layer: structure
tags: [fleet, module, core, reference, identifiers]
created: 2025-11-09
links:
  - "[[structure/synthetic-warehouse-robotics/module-fleet-controller]]"
  - "[[business-logic/synthetic-warehouse-robotics/robot-decommission-policy]]"
  - "[[business-logic/synthetic-warehouse-robotics/robot-fault-escalation-policy]]"
---

# fleet-controller — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด fleet-controller สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-warehouse-robotics/module-fleet-controller]])

## Public functions
- `getAvailableRobots(zoneId: string): Promise<Robot[]>` — คืนรายการหุ่นยนต์ที่ว่างและอยู่ในโซนที่ระบุ
- `recordHeartbeat(robotId: string, telemetry: Telemetry): Promise<void>` — บันทึก heartbeat ที่หุ่นยนต์ส่งเข้ามาทุก 2 วินาที
- `markRobotFault(robotId: string, faultCode: string): Promise<void>` — เปลี่ยนสถานะหุ่นยนต์เป็น fault และหยุดจ่ายงานใหม่ให้ตัวนั้นทันที
- `decommissionRobot(robotId: string, reason: string): Promise<void>` — ปลดระวางหุ่นยนต์ถาวร ดู [[business-logic/synthetic-warehouse-robotics/robot-decommission-policy]]

## Internal constants
- `HEARTBEAT_INTERVAL_MS = 2000`
- `OFFLINE_AFTER_MISSED_BEATS = 5`

## Type

```ts
interface Robot {
  robotId: string;
  status: "idle" | "assigned" | "moving" | "picking" | "returning" | "fault" | "charging";
  batteryPct: number;
  zoneId: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการ escalate fault ที่ [[business-logic/synthetic-warehouse-robotics/robot-fault-escalation-policy]]
