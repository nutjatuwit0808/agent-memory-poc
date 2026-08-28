---
layer: structure
tags: [invoice, module]
created: 2025-11-18
links:
  - "[[structure/synthetic-subscription-billing/module-proration-calculator]]"
  - "[[structure/synthetic-subscription-billing/module-usage-meter]]"
  - "[[business-logic/synthetic-subscription-billing/invoice-due-date-calculation-policy]]"
---

# Module: invoice-generator

สร้างใบแจ้งหนี้จากข้อมูลแพลนปัจจุบัน ผล proration และการใช้งานที่วัดได้ ไม่คำนวณราคาเอง อ่านผลจาก service อื่นเท่านั้น แยกออกมาเพื่อให้รูปแบบเอกสารใบแจ้งหนี้เปลี่ยนได้อิสระจาก logic การคำนวณราคา

## ฟังก์ชันหลัก
- `generateInvoice(subscriptionId: string, billingPeriod: TimeRange): Promise<string>` — สร้างใบแจ้งหนี้สำหรับรอบบิลหนึ่ง คืน invoiceId
- `getInvoiceDueDate(subscriptionId: string, generatedAt: string): Promise<string>` — คำนวณวันครบกำหนดชำระตามนโยบาย
- `voidInvoice(invoiceId: string, reason: string): Promise<void>` — ยกเลิกใบแจ้งหนี้ที่ออกผิดพลาด

## ความสัมพันธ์กับ module อื่น

ดึงข้อมูลจาก [[structure/synthetic-subscription-billing/module-proration-calculator]] และ [[structure/synthetic-subscription-billing/module-usage-meter]] มาประกอบเป็นใบแจ้งหนี้เดียว ดู [[business-logic/synthetic-subscription-billing/invoice-due-date-calculation-policy]]
