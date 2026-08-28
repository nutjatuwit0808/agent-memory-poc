---
layer: structure
tags: [billing, module]
created: 2026-07-20
links:
  - "[[structure/synthetic-energy-management/module-meter-collector]]"
---

# Module: utility-bill-reconciler

เทียบข้อมูลการใช้พลังงานที่ระบบวัดได้กับใบแจ้งหนี้จากการไฟฟ้า/ประปาจริง เพื่อตรวจสอบว่ามีความคลาดเคลื่อนหรือไม่ ช่วยให้ทีมอาคารต่อรองหรือทักท้วงบิลที่ผิดปกติได้ทันเวลาก่อนครบกำหนดชำระ

## ฟังก์ชันหลัก
- `importUtilityBill(facilityId: string, bill: UtilityBillData): Promise<void>` — นำเข้าข้อมูลใบแจ้งหนี้จากการไฟฟ้า/ประปา
- `reconcile(facilityId: string, billingPeriod: TimeRange): Promise<ReconciliationResult>` — เทียบข้อมูลที่วัดได้กับบิลจริง คืนผลต่างถ้ามี
- `flagDiscrepancy(facilityId: string, discrepancy: number): Promise<void>` — แจ้งเตือนทีมอาคารเมื่อพบความคลาดเคลื่อนเกินเกณฑ์

## ความสัมพันธ์กับ module อื่น

ต้องรอข้อมูลครบทั้งช่วงเวลาบิลจาก [[structure/synthetic-energy-management/module-meter-collector]] ก่อนเทียบเสมอ ถ้าข้อมูลมีช่วงขาดหาย (meter offline) จะ flag ผลการเทียบว่าไม่สมบูรณ์แทนการเทียบด้วยข้อมูลไม่ครบ
