---
layer: structure
tags: [bandwidth, throttle, module]
created: 2026-01-15
links:
  - "[[business-logic/synthetic-content-delivery/bandwidth-throttle-policy]]"
  - "[[support-cases/synthetic-content-delivery/case-5216]]"
---

# Module: bandwidth-throttler

ควบคุม bandwidth ที่แต่ละ tenant ใช้ได้ตาม quota ที่ตกลงไว้ในสัญญา และทำ adaptive bitrate configuration สำหรับ video streaming ในช่วง traffic spike เพื่อรักษา availability ให้ผู้ชมทั้งหมดแทนที่จะเสิร์ฟ quality สูงให้คนบางส่วนแต่คนที่เหลือเจอ buffering แยกออกมาเป็น service ต่างหากเพราะ bandwidth accounting ต้องแม่นยำมาก เกี่ยวกับการเรียกเก็บเงินโดยตรง

## ฟังก์ชันหลัก
- `checkQuota(tenantId: string): Promise<QuotaStatus>` — ตรวจสอบ quota ที่เหลือและ rate ปัจจุบันของ tenant
- `applyThrottle(tenantId: string, limitMbps: number): Promise<void>` — ตั้ง bandwidth limit สำหรับ tenant ทันที ผลมีผลใน edge node ทุกจุดภายในไม่เกิน 30 วินาที
- `adjustBitrateProfile(tenantId: string, condition: NetworkCondition): Promise<BitrateProfile>` — คำนวณ adaptive bitrate profile ที่เหมาะกับสถานการณ์เครือข่ายปัจจุบัน ตาม [[business-logic/synthetic-content-delivery/bandwidth-throttle-policy]]
- `recordUsage(tenantId: string, bytes: number, edgeNodeId: string): Promise<void>` — บันทึกปริมาณ bandwidth ที่ใช้จริงสำหรับการคำนวณ quota และ billing

## ความสัมพันธ์กับ module อื่น

ถ้า tenant ใช้ bandwidth เกิน quota 90% จะแจ้งเตือนทีม account management ก่อน ไม่ throttle ทันที — throttle อัตโนมัติจะเกิดขึ้นที่ 100% เท่านั้น เพื่อไม่ให้ผู้ใช้ปลายทางเจอปัญหาโดยไม่มีการแจ้งเตือน ดู [[business-logic/synthetic-content-delivery/bandwidth-throttle-policy]] และดู [[support-cases/synthetic-content-delivery/case-5216]] สำหรับกรณีที่ throttle ถูก tenant ผิด
