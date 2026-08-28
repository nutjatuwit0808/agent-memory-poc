---
layer: structure
tags: [demand-response, module, core, reference, identifiers]
created: 2025-11-23
links:
  - "[[structure/synthetic-energy-management/module-demand-response-controller]]"
  - "[[business-logic/synthetic-energy-management/demand-threshold-load-shedding-policy]]"
---

# demand-response-controller — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด demand-response-controller สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-energy-management/module-demand-response-controller]])

## Public functions
- `evaluateDemand(facilityId: string, currentLoad: number): Promise<DemandDecision>` — ประเมินว่าต้อง trigger demand response หรือไม่ตามระดับ load ปัจจุบัน
- `triggerLoadShedding(facilityId: string, equipmentIds: string[]): Promise<string>` — สั่งลดโหลดอุปกรณ์ที่ระบุ คืน demandEventId
- `resolveDemandEvent(demandEventId: string): Promise<void>` — ยกเลิกสถานะ demand response เมื่อ load กลับสู่ระดับปกติ

## Internal constants
- `DEMAND_THRESHOLD_KW_DEFAULT = 5000`
- `LOAD_SHED_COOLDOWN_MIN = 30`

## Type

```ts
interface DemandDecision {
  shouldShedLoad: boolean;
  targetReductionKw: number;
  candidateEquipment: string[];
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เต็มที่ [[business-logic/synthetic-energy-management/demand-threshold-load-shedding-policy]]
