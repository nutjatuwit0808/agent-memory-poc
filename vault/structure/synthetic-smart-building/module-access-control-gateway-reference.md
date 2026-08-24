---
layer: structure
tags: [access-control, module, core, reference, identifiers]
created: 2026-03-06
links:
  - "[[structure/synthetic-smart-building/module-access-control-gateway]]"
  - "[[business-logic/synthetic-smart-building/access-control-lockout-policy]]"
---

# access-control-gateway — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด access-control-gateway สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-smart-building/module-access-control-gateway]])

## Public functions
- `evaluateBadgeSwipe(badgeId: string, doorId: string): Promise<AccessResult>` — ตรวจสิทธิ์บัตรกับประตูที่ปัดจริง คืนผล allow/deny พร้อมเหตุผล
- `scheduleDoorState(doorId: string, state: DoorScheduleState, window: TimeWindow): Promise<void>` — ตั้งตารางสถานะประตูล่วงหน้า เช่น unlock ช่วงเวลาทำการ
- `overrideDoorState(doorId: string, state: "unlocked" | "locked", reason: string): Promise<void>` — สั่ง override สถานะประตูทันทีนอกเหนือ schedule ปกติ

## Internal constants
- `BADGE_CACHE_TTL_MS = 60000`
- `DOOR_UNLOCK_PULSE_MS = 5000`
- `EMERGENCY_EGRESS_ALWAYS_UNLOCK = true`

## Type

```ts
interface AccessResult {
  allowed: boolean;
  badgeId: string;
  doorId: string;
  denyReason?: "expired" | "wrong_zone" | "schedule_locked";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการล็อกช่วง fire drill ที่ [[business-logic/synthetic-smart-building/access-control-lockout-policy]]
