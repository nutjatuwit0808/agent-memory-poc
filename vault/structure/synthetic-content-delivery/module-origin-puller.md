---
layer: structure
tags: [origin, module, core]
created: 2025-12-23
links:
  - "[[business-logic/synthetic-content-delivery/origin-retry-policy]]"
  - "[[structure/synthetic-content-delivery/module-cache-coordinator]]"
  - "[[structure/synthetic-content-delivery/module-bandwidth-throttler]]"
---

# Module: origin-puller

ดึงเนื้อหาจาก origin server ของ tenant เมื่อ cache miss หรือเมื่อ cache coordinator ส่งสัญญาณว่าต้อง revalidate เป็น service ที่อยู่บน critical path ของผู้ใช้โดยตรง เพราะถ้า origin puller ช้าหรือล้มเหลว ผู้ใช้ก็รอนาน ออกแบบให้มี retry และ circuit breaker เพื่อป้องกัน origin ถูก flood ระหว่าง cache miss storm

## ฟังก์ชันหลัก
- `pull(tenantId: string, originUrl: string, contentKey: string): Promise<PullResult>` — ดึงเนื้อหาจาก origin พร้อม HTTP header ที่จำเป็น คืนผลและ metadata สำหรับ cache coordinator
- `validateOriginResponse(response: OriginResponse): ValidationResult` — ตรวจสอบว่า origin response มี header ที่ถูกต้องและ content ไม่เสียหาย
- `handleOriginFailure(tenantId: string, originUrl: string, error: OriginError): Promise<FallbackResult>` — เลือก fallback strategy เมื่อ origin ตอบ 5xx ตาม [[business-logic/synthetic-content-delivery/origin-retry-policy]]

## State

idle → pulling → succeeded | failed_retryable | failed_permanent — ดู [[business-logic/synthetic-content-delivery/origin-retry-policy]] สำหรับเงื่อนไข retry และ circuit break

## ความสัมพันธ์กับ module อื่น

หลังดึงสำเร็จจะแจ้ง [[structure/synthetic-content-delivery/module-cache-coordinator]] ผ่าน `recordPull` เสมอ และถ้า origin ล้มเหลวเกินเกณฑ์จะเปิด circuit breaker ผ่าน [[structure/synthetic-content-delivery/module-bandwidth-throttler]] เพื่อไม่ให้ edge node อื่น pile-up request ไปที่ origin เดียวกัน
