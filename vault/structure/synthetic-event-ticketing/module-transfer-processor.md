---
layer: structure
tags: [transfer, module]
created: 2026-03-21
links:
  - "[[business-logic/synthetic-event-ticketing/transfer-eligibility-rules-policy]]"
---

# Module: transfer-processor

ประมวลผลการโอนบัตรระหว่างผู้ชม (เช่น เพื่อนซื้อบัตรแล้วโอนให้อีกคนที่ไปงานจริง) เป็นจุดเดียวที่ตรวจสอบสิทธิ์การโอนและอัปเดตความเป็นเจ้าของบัตร ทั้ง transfer ปกติและ resale ต้องผ่านจุดนี้เสมอเพื่อให้ validation เดียวกันครอบคลุมทุกเส้นทาง

## ฟังก์ชันหลัก
- `initiateTransfer(ticketId: string, fromBuyerId: string, toBuyerId: string): Promise<string>` — เริ่มการโอนบัตร ตรวจสอบสิทธิ์ก่อนดำเนินการ
- `acceptTransfer(transferId: string): Promise<void>` — ผู้รับยืนยันรับบัตร อัปเดตความเป็นเจ้าของ
- `checkTransferEligibility(ticketId: string): Promise<EligibilityResult>` — ตรวจสอบว่าบัตรใบนี้โอนได้หรือไม่ตามเงื่อนไข

## ความสัมพันธ์กับ module อื่น

ดู [[business-logic/synthetic-event-ticketing/transfer-eligibility-rules-policy]] สำหรับเงื่อนไขว่าบัตรประเภทไหนโอนได้บ้าง — บัตรบางประเภท (เช่น บัตรราคาพิเศษผูกชื่อ) โอนไม่ได้เลย
