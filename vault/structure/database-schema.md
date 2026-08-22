---
layer: structure
tags: [database, schema]
created: 2026-01-22
links:
  - "[[structure/service-boundaries]]"
---

# Database Schema (ภาพรวม)

แต่ละ service มี PostgreSQL database แยกกันคนละ instance ตาม [[structure/service-boundaries]]

## order-service

```
orders (id, customer_id, status, total_amount, created_at, updated_at)
order_items (id, order_id, sku, quantity, unit_price)
```

## payment-service

```
payments (id, order_id, gateway, gateway_ref, amount, status, created_at)
```

## refund-service

```
refunds (id, order_id, payment_id, amount, reason, status, requested_at, completed_at)
```

## inventory-service

```
stock (sku, available_qty, reserved_qty)
reservations (id, sku, order_id, quantity, expires_at)
```

## กติกา

- ห้าม foreign key ข้าม database — ความสัมพันธ์ข้าม service เก็บแค่ id เฉยๆ แล้วให้ application layer เป็นคนต่อข้อมูล
- ทุกตารางมี `created_at` แต่ไม่ใช่ทุกตารางมี `updated_at` — เติมเฉพาะตารางที่ state เปลี่ยนได้หลังสร้าง
