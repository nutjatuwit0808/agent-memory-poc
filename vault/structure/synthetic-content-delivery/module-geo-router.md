---
layer: structure
tags: [geo, routing, module]
created: 2026-01-22
links:
  - "[[business-logic/synthetic-content-delivery/geo-restriction-policy]]"
  - "[[support-cases/synthetic-content-delivery/case-3682]]"
---

# Module: geo-router

ตัดสินใจว่าจะส่ง request จาก client ไปยัง edge node จุดไหน โดยพิจารณาทั้งความใกล้-ไกลทางภูมิศาสตร์, load ของ PoP แต่ละจุด, และ geo-restriction rule ที่ tenant กำหนดไว้ เป็น service เดียวที่รู้จัก topology ของ edge network ทั้งหมด ทำให้เป็นจุดเดียวที่ต้องอัปเดตเมื่อเพิ่มหรือถอด PoP ออกจากเครือข่าย

## ฟังก์ชันหลัก
- `resolveEdgeNode(clientIp: string, tenantId: string, contentKey: string): Promise<EdgeNode>` — เลือก PoP ที่เหมาะสมที่สุดสำหรับ request นี้ตาม latency, load, และ geo-rule
- `isContentRestricted(tenantId: string, contentKey: string, clientCountry: string): boolean` — ตรวจสอบว่า content ชิ้นนี้ถูกจำกัดสำหรับประเทศที่ client อยู่หรือไม่
- `updateGeoRules(tenantId: string, rules: GeoRule[]): Promise<void>` — อัปเดต geo-restriction rule ของ tenant พร้อม propagate ไปยัง edge node ที่เกี่ยวข้อง
- `listAvailableNodes(region: string): Promise<EdgeNode[]>` — คืนรายการ edge node ที่ online ในภูมิภาคที่ระบุ พร้อม capacity และ latency ปัจจุบัน

## ความสัมพันธ์กับ module อื่น

ถ้า client อยู่ในประเทศที่ถูกจำกัด `resolveEdgeNode` จะไม่คืน edge node ให้เลยและ request จะถูกปฏิเสธทันทีก่อนถึงขั้น cache lookup ดู [[business-logic/synthetic-content-delivery/geo-restriction-policy]] สำหรับรายละเอียด และดู [[support-cases/synthetic-content-delivery/case-3682]] สำหรับกรณีที่เคยเกิดปัญหา
