---
layer: structure
tags: [eta, module, core, reference, identifiers]
created: 2026-07-27
links:
  - "[[structure/synthetic-food-delivery/module-eta-estimator]]"
  - "[[structure/synthetic-food-delivery/module-restaurant-relay]]"
  - "[[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]]"
---

# eta-estimator — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด eta-estimator สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-food-delivery/module-eta-estimator]])

## Public functions
- `estimateETA(orderId: string, driverId: string, restaurantId: string): Promise<ETABreakdown>` — คำนวณ ETA รวม 3 ส่วนพร้อม confidence interval
- `refreshETA(orderId: string): Promise<ETABreakdown>` — อัปเดต ETA เมื่อ traffic หรือสถานการณ์เปลี่ยน เรียกทุก 2 นาทีต่อออร์เดอร์ที่ active
- `getRestaurantPrepTime(restaurantId: string, itemCount: number): Promise<number>` — ประมาณเวลาเตรียมอาหารโดย query ประวัติร้านจาก [[structure/synthetic-food-delivery/module-restaurant-relay]]

## Internal constants
- `ETA_REFRESH_INTERVAL_SEC = 120`
- `TRAFFIC_DATA_TIMEOUT_MS = 2000`
- `FALLBACK_SPEED_KM_PER_HR = 25`

## Type

```ts
interface ETABreakdown {
  orderId: string;
  driverToRestaurantMin: number;
  restaurantPrepMin: number;
  restaurantToCustomerMin: number;
  totalMin: number;
  confidence: "high" | "low"; // low = ใช้ fallback
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง ETA fallback ที่ [[business-logic/synthetic-food-delivery/driver-acceptance-timeout-policy]]
