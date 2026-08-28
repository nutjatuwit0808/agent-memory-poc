---
layer: structure
tags: [carbon, sustainability, module]
created: 2025-11-29
links:
  - "[[structure/synthetic-energy-management/module-meter-collector]]"
---

# Module: carbon-calculator

คำนวณคาร์บอนฟุตพรินต์จากการใช้พลังงานตาม emission factor ของแหล่งพลังงานแต่ละประเภท สร้างรายงานรายเดือนให้ทีมความยั่งยืนขององค์กร แยกออกมาจาก meter-collector เพราะสูตรคำนวณคาร์บอนเปลี่ยนตามมาตรฐานการรายงานที่อัปเดตเป็นระยะ ไม่ใช่ค่าคงที่ถาวร

## ฟังก์ชันหลัก
- `calculateFootprint(facilityId: string, period: TimeRange): Promise<CarbonReport>` — คำนวณคาร์บอนฟุตพรินต์ของ facility ในช่วงเวลาที่กำหนด
- `updateEmissionFactor(energyType: string, factor: number): Promise<void>` — อัปเดตค่า emission factor ตามมาตรฐานใหม่
- `generateMonthlyReport(facilityId: string, month: string): Promise<string>` — สร้างรายงานรายเดือน คืน reportId

## ความสัมพันธ์กับ module อื่น

ดึงข้อมูลการใช้พลังงานจาก [[structure/synthetic-energy-management/module-meter-collector]] แบบ aggregate รายเดือน ไม่คำนวณจาก raw reading ทุกจุดเพื่อลด load ต่อฐานข้อมูล
