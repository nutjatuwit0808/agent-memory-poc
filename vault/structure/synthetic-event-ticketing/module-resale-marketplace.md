---
layer: structure
tags: [resale, module]
created: 2026-06-15
links:
  - "[[structure/synthetic-event-ticketing/module-transfer-processor]]"
  - "[[business-logic/synthetic-event-ticketing/resale-price-cap-policy]]"
---

# Module: resale-marketplace

ตลาดขายต่อบัตรอย่างเป็นทางการที่จำกัดราคาขายต่อไม่ให้สูงเกินเพดานที่กำหนด เพื่อป้องกันการเก็งกำไรบัตรและปกป้องผู้ซื้อรายย่อยจากราคาที่สูงเกินจริง แยกออกมาจาก transfer-processor เพราะมี business logic เรื่องราคาและ marketplace listing ที่ซับซ้อนกว่าการโอนธรรมดามาก

## ฟังก์ชันหลัก
- `listForResale(ticketId: string, askPrice: number): Promise<string>` — ลงขายบัตรต่อ ตรวจสอบว่าราคาไม่เกินเพดานก่อนอนุมัติ คืน listingId
- `purchaseResaleTicket(listingId: string, buyerId: string): Promise<string>` — ซื้อบัตรจากตลาดขายต่อ เรียก transfer-processor ให้โอนความเป็นเจ้าของ
- `cancelListing(listingId: string): Promise<void>` — ยกเลิกการลงขาย

## ความสัมพันธ์กับ module อื่น

ทุกการซื้อขายสำเร็จเรียก [[structure/synthetic-event-ticketing/module-transfer-processor]] ให้ทำการโอนจริงเสมอ ไม่มี logic โอนความเป็นเจ้าของแยกต่างหากใน service นี้ ดู [[business-logic/synthetic-event-ticketing/resale-price-cap-policy]]
