---
layer: structure
tags: [payout, module]
created: 2026-02-24
links:
  - "[[structure/synthetic-food-delivery/module-surge-pricer]]"
  - "[[business-logic/synthetic-food-delivery/driver-payout-calculation-policy]]"
---

# Module: driver-payout-engine

คำนวณรายได้ของคนขับต่อออร์เดอร์ รวมถึง base fee, distance bonus, tip ที่ลูกค้าให้, และ surge bonus ถ้ามี ทำงานแบบ event-driven โดย subscribe event `order.delivered` จาก queue แล้วคำนวณและบันทึก payout record ทันที แยกออกมาเพราะ logic การคำนวณรายได้เปลี่ยนบ่อยตาม promotion

## ฟังก์ชันหลัก
- `calculatePayout(orderId: string, driverId: string): Promise<PayoutRecord>` — คำนวณรายได้ทั้งหมดสำหรับออร์เดอร์หนึ่ง
- `adjustPayoutForCancellation(orderId: string, cancellationStage: string): Promise<void>` — ปรับรายได้ถ้าออร์เดอร์ถูกยกเลิกหลังคนขับรับงานแล้ว
- `batchTransferPayout(driverId: string, periodEnd: string): Promise<TransferSummary>` — รวบรวมรายได้ค้างจ่ายและส่งไปยัง payment processor รอบสัปดาห์

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-food-delivery/module-surge-pricer]] โดยตรง — surge bonus คำนวณจาก `surge_multiplier` ที่ถูก snapshot ไว้ใน order record ตอนลูกค้าสั่ง ไม่ใช่ค่า surge ปัจจุบัน เพื่อป้องกัน payout ผิดถ้า surge เปลี่ยนระหว่างที่คนขับกำลังส่งอยู่ อ้างอิง [[business-logic/synthetic-food-delivery/driver-payout-calculation-policy]]
