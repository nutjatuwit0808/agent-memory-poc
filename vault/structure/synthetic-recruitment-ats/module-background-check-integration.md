---
layer: structure
tags: [background-check, module]
created: 2025-11-02
links:
  - "[[structure/synthetic-recruitment-ats/module-offer-approval-workflow]]"
  - "[[business-logic/synthetic-recruitment-ats/background-check-sla-policy]]"
---

# Module: background-check-integration

เชื่อมต่อกับผู้ให้บริการตรวจสอบประวัติภายนอก (third-party vendor) ส่งคำขอตรวจสอบและรับผลกลับผ่าน webhook เป็นหลัก ไม่ได้ประมวลผลตรวจสอบเอง แค่ทำหน้าที่ orchestrate คำขอและ normalize ผลลัพธ์จาก vendor หลายเจ้าที่มี response format ต่างกัน

## ฟังก์ชันหลัก
- `initiateCheck(candidateId: string, checkType: CheckType): Promise<string>` — ส่งคำขอตรวจสอบประวัติไปยัง vendor คืน checkId
- `handleWebhookResult(vendorPayload: unknown): Promise<void>` — รับผลจาก vendor webhook แล้ว normalize เข้ารูปแบบกลาง
- `getCheckStatus(checkId: string): Promise<CheckStatus>` — คืนสถานะการตรวจสอบล่าสุด

## ความสัมพันธ์กับ module อื่น

publish event `background_check.completed` ให้ [[structure/synthetic-recruitment-ats/module-offer-approval-workflow]] subscribe ต่อ ดู [[business-logic/synthetic-recruitment-ats/background-check-sla-policy]] สำหรับกติกาเมื่อการตรวจสอบใช้เวลานานผิดปกติจนกระทบวันเริ่มงาน
