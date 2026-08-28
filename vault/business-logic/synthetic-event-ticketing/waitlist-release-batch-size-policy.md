---
layer: business-logic
tags: [waitlist, policy]
created: 2026-02-08
links:
  - "[[business-logic/synthetic-event-ticketing/waitlist-release-batch-size-policy-edge-cases]]"
---

# นโยบายขนาด Batch การปล่อยสิทธิ์ Waitlist

เมื่อมีที่นั่งว่างจากการยกเลิกหรือ hold หมดอายุ ระบบจะปล่อยสิทธิ์ให้คนในคิว waitlist ทีละ `WAITLIST_RELEASE_BATCH_SIZE_DEFAULT` คนตามลำดับ ไม่ปล่อยทีเดียวหมดทุกคนในคิว เพื่อไม่ให้ที่นั่งที่มีจำกัดถูกจองพร้อมกันจนเกิดการแย่งกันเอง

คนที่ได้รับสิทธิ์ (`offered`) มีเวลา `WAITLIST_OFFER_CLAIM_WINDOW_MIN` นาทีในการยืนยันซื้อ ถ้าไม่ทันเวลาสิทธิ์จะถูกยกเลิกและส่งต่อให้คนถัดไปในคิวโดยอัตโนมัติ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-event-ticketing/waitlist-release-batch-size-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
