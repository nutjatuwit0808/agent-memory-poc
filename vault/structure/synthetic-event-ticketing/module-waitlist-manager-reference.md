---
layer: structure
tags: [waitlist, module, core, reference, identifiers]
created: 2025-11-07
links:
  - "[[structure/synthetic-event-ticketing/module-waitlist-manager]]"
  - "[[business-logic/synthetic-event-ticketing/waitlist-release-batch-size-policy]]"
---

# waitlist-manager — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด waitlist-manager สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-event-ticketing/module-waitlist-manager]])

## Public functions
- `joinWaitlist(buyerId: string, eventId: string): Promise<string>` — ลงทะเบียนเข้าคิว waitlist คืน waitlistEntryId
- `releaseNextBatch(eventId: string, seatCount: number): Promise<string[]>` — ปล่อยสิทธิ์ซื้อให้คนในคิวตามลำดับเมื่อมีที่นั่งว่าง คืนรายชื่อ buyerId ที่ได้รับสิทธิ์
- `getWaitlistPosition(buyerId: string, eventId: string): Promise<number>` — คืนลำดับปัจจุบันของผู้ซื้อในคิว

## Internal constants
- `WAITLIST_OFFER_CLAIM_WINDOW_MIN = 20`
- `WAITLIST_RELEASE_BATCH_SIZE_DEFAULT = 5`

## Type

```ts
interface WaitlistEntry {
  entryId: string;
  buyerId: string;
  eventId: string;
  status: "waiting" | "offered" | "claimed" | "expired";
  joinedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องขนาด batch การปล่อยสิทธิ์ที่ [[business-logic/synthetic-event-ticketing/waitlist-release-batch-size-policy]]
