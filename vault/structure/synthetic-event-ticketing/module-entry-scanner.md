---
layer: structure
tags: [scanning, module, core]
created: 2025-12-25
links:
  - "[[business-logic/synthetic-event-ticketing/entry-scan-duplicate-prevention-policy]]"
---

# Module: entry-scanner

ตรวจสอบและบันทึกการสแกนบัตรเข้างานที่สถานที่จัดจริง ต้องทำงานได้แม้ network หน้างานไม่เสถียร เพราะสถานที่จัดงานขนาดใหญ่บางแห่งมีปัญหาสัญญาณเน็ตช่วงคนเข้างานพร้อมกันจำนวนมาก

## ฟังก์ชันหลัก
- `scanTicket(ticketId: string, gateId: string): Promise<ScanResult>` — สแกนบัตร ตรวจสอบความถูกต้องและสถานะการใช้งาน
- `checkDuplicateEntry(ticketId: string): Promise<boolean>` — ตรวจสอบว่าบัตรใบนี้เคยถูกสแกนผ่านไปแล้วหรือไม่
- `getEntryLog(eventId: string): Promise<ScanRecord[]>` — คืนประวัติการสแกนทั้งหมดของงานหนึ่งสำหรับทีมความปลอดภัย

## ความสัมพันธ์กับ module อื่น

publish event `entry.scanned` ทุกครั้งไม่ว่าสำเร็จหรือถูกปฏิเสธ เพื่อให้ทีมความปลอดภัยหน้างานเห็น log แบบ real-time ดู [[business-logic/synthetic-event-ticketing/entry-scan-duplicate-prevention-policy]]
