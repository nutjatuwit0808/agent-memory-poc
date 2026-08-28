---
layer: structure
tags: [resale, module, reference, identifiers]
created: 2026-06-08
links:
  - "[[structure/synthetic-event-ticketing/module-resale-marketplace]]"
  - "[[business-logic/synthetic-event-ticketing/resale-price-cap-policy]]"
---

# resale-marketplace — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด resale-marketplace สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-event-ticketing/module-resale-marketplace]])

## Public functions
- `listForResale(ticketId: string, askPrice: number): Promise<string>` — ลงขายบัตรต่อ ตรวจสอบว่าราคาไม่เกินเพดานก่อนอนุมัติ คืน listingId
- `purchaseResaleTicket(listingId: string, buyerId: string): Promise<string>` — ซื้อบัตรจากตลาดขายต่อ เรียก transfer-processor ให้โอนความเป็นเจ้าของ
- `cancelListing(listingId: string): Promise<void>` — ยกเลิกการลงขาย

## Internal constants
- `RESALE_PRICE_CAP_MULTIPLIER = 1.1`
- `RESALE_LISTING_EXPIRY_DAYS = 7`

## Type

```ts
interface ResaleListing {
  listingId: string;
  ticketId: string;
  askPrice: number;
  status: "active" | "sold" | "cancelled" | "expired";
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องเพดานราคาที่ [[business-logic/synthetic-event-ticketing/resale-price-cap-policy]]
