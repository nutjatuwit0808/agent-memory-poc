---
layer: business-logic
tags: [export, retry, policy]
created: 2026-01-08
links:
  - "[[structure/synthetic-customer-segmentation/module-channel-exporter]]"
  - "[[structure/synthetic-customer-segmentation/module-membership-refresher]]"
  - "[[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy-edge-cases]]"
---

# นโยบาย Channel Sync Retry Limit

เมื่อ export ไปยัง marketing channel ล้มเหลว [[structure/synthetic-customer-segmentation/module-channel-exporter]] จะ retry ตาม exponential backoff สูงสุด `EXPORT_MAX_RETRY_COUNT` ครั้งก่อนถือว่า export นั้น `failed` และแจ้ง owner segment

ห้าม retry ถ้า channel ตอบกลับด้วย `4xx` error (ยกเว้น `429 rate_limit`) เพราะมักหมายถึง config ผิดหรือ credential expired ที่ไม่หายเองจาก retry — retry ในกรณีนั้นเปลืองโควต้า API โดยเปล่าประโยชน์

## การป้องกัน Concurrent Refresh Instance

นโยบายนี้ยังครอบคลุม [[structure/synthetic-customer-segmentation/module-membership-refresher]] ด้วย — `MAX_CONCURRENT_REFRESH_JOBS` ถูก set เป็น 1 ตลอดเวลา ถ้า refresh job ใหม่ถูก trigger ขณะที่มี job รันอยู่แล้ว job ใหม่จะถูก queue ไว้รอ ไม่รันซ้อนกัน เพราะ concurrent refresh บน event store เดียวกันทำให้ membership snapshot ที่ได้ไม่ consistent

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
