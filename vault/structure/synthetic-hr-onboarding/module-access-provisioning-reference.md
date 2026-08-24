---
layer: structure
tags: [provisioning, module, core, reference, identifiers]
created: 2026-07-09
links:
  - "[[structure/synthetic-hr-onboarding/module-access-provisioning]]"
  - "[[business-logic/synthetic-hr-onboarding/day-one-access-policy]]"
---

# access-provisioning — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด access-provisioning สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-hr-onboarding/module-access-provisioning]])

## Public functions
- `provisionAccess(hireId: string, accessBundleId: string): Promise<ProvisionRequest>` — ยื่นคำขอสิทธิ์ทั้งชุดตาม role (laptop, software, badge) เข้าคิว
- `revokeAccess(hireId: string, reason: string): Promise<void>` — เพิกถอนสิทธิ์ทั้งหมด เช่น กรณีพนักงานยกเลิกก่อนเริ่มงาน
- `checkProvisionStatus(hireId: string): Promise<ProvisionStatus>` — คืนสถานะการจัดสิทธิ์แต่ละรายการใน bundle

## Internal constants
- `PROVISION_QUEUE_MAX_DEPTH = 200`
- `BADGE_SYSTEM_TIMEOUT_MS = 8000`

## Type

```ts
interface ProvisionRequest {
  hireId: string;
  accessBundleId: string;
  status: "queued" | "dispatched" | "confirmed" | "failed";
  items: { kind: "laptop" | "software" | "badge"; status: string }[];
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง deadline วันเริ่มงานที่ [[business-logic/synthetic-hr-onboarding/day-one-access-policy]]
