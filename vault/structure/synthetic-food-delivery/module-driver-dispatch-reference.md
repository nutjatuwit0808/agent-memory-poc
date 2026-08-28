---
layer: structure
tags: [dispatch, module, core, reference, identifiers]
created: 2025-12-15
links:
  - "[[structure/synthetic-food-delivery/module-driver-dispatch]]"
  - "[[business-logic/synthetic-food-delivery/driver-rating-threshold-policy]]"
---

# driver-dispatch — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด driver-dispatch สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-food-delivery/module-driver-dispatch]])

## Public functions
- `getAvailableDrivers(location: LatLng, radiusKm: number): Promise<Driver[]>` — คืนรายการคนขับที่ online และว่างอยู่ในรัศมีที่กำหนด เรียงตามระยะทาง
- `assignOrderToDriver(driverId: string, orderId: string): Promise<void>` — ล็อกออร์เดอร์ให้คนขับ เปลี่ยนสถานะคนขับเป็น busy ทันที
- `recordLocationUpdate(driverId: string, location: LatLng, timestamp: string): Promise<void>` — บันทึก location update ที่คนขับส่งเข้ามาทุก 3-5 วินาที
- `markDriverOffline(driverId: string, reason: string): Promise<void>` — เปลี่ยนสถานะคนขับเป็น offline และ requeue ออร์เดอร์ที่ยังไม่ถูก pick up

## Internal constants
- `LOCATION_UPDATE_INTERVAL_SEC = 4`
- `DRIVER_OFFLINE_AFTER_MISSED_UPDATES = 6`
- `MAX_CONCURRENT_ORDERS_PER_DRIVER = 2`

## Type

```ts
interface Driver {
  driverId: string;
  status: "online_idle" | "online_assigned" | "online_busy" | "offline";
  location: LatLng;
  activeOrderIds: string[];
  ratingAvg: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง rating threshold ที่ [[business-logic/synthetic-food-delivery/driver-rating-threshold-policy]]
