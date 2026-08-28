---
layer: structure
tags: [routing, module, core, reference, identifiers]
created: 2026-01-19
links:
  - "[[structure/synthetic-food-delivery/module-order-router]]"
  - "[[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy]]"
  - "[[business-logic/synthetic-food-delivery/max-delivery-radius-policy]]"
  - "[[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]]"
---

# order-router — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด order-router สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-food-delivery/module-order-router]])

## Public functions
- `routeOrder(orderId: string, restaurantId: string, customerLocation: LatLng): Promise<RoutingResult>` — เลือกคนขับที่เหมาะสมที่สุดสำหรับออร์เดอร์ คืนผลว่าจับคู่สำเร็จหรือไม่มีคนขับว่าง
- `requeueOrder(orderId: string, reason: string): Promise<void>` — ดันออร์เดอร์กลับเข้าคิวเมื่อคนขับปฏิเสธหรือออฟไลน์กะทันหัน
- `cancelOrder(orderId: string, initiatedBy: 'customer' | 'restaurant' | 'system'): Promise<void>` — ยกเลิกออร์เดอร์พร้อมบันทึกผู้ริเริ่ม เพื่อใช้คำนวณค่าปรับตาม [[business-logic/synthetic-food-delivery/restaurant-cancellation-penalty-policy]]
- `getOrderStatus(orderId: string): Promise<OrderStatus>` — คืนสถานะออร์เดอร์ปัจจุบันพร้อม ETA ล่าสุด

## Internal constants
- `MAX_DISPATCH_RADIUS_KM = 8`
- `ORDER_PENDING_TIMEOUT_SEC = 90`
- `MAX_REQUEUE_ATTEMPTS = 3`

## Type

```ts
interface RoutingResult {
  orderId: string;
  driverId: string | null;
  status: "assigned" | "no_driver_available" | "outside_radius";
  estimatedPickupMin: number;
}
```

เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ [[business-logic/synthetic-food-delivery/max-delivery-radius-policy]] และ [[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]]
