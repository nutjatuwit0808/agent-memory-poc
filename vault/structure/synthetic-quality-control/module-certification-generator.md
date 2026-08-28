---
layer: structure
tags: [certification, module]
created: 2026-07-23
links:
  - "[[business-logic/synthetic-quality-control/certification-template-version-policy]]"
  - "[[structure/synthetic-quality-control/module-quarantine-manager]]"
---

# Module: certification-generator

ออกใบรับรองคุณภาพสำหรับ batch ที่ผ่านการตรวจแล้วเพื่อแนบไปกับ shipment ตรวจสอบก่อนออกว่า batch อยู่ในสถานะ `pass` จริง ไม่มี active hold และใช้ template เวอร์ชันล่าสุดที่ลูกค้าปลายทางยอมรับ สร้างขึ้นเป็น service แยกเพราะ template และรูปแบบใบรับรองแตกต่างกันตามข้อกำหนดของแต่ละลูกค้าและมาตรฐาน ISO

## ฟังก์ชันหลัก
- `issueCertification(batchId: string, templateVersion: string, requestedBy: string): Promise<CertificationId>` — ออกใบรับรองสำหรับ batch ที่ผ่านแล้ว ตรวจสอบ precondition ทุกข้อก่อนออก
- `getActiveTemplateVersion(customerId: string): string` — คืนเวอร์ชัน template ล่าสุดที่ลูกค้ารายนั้นยอมรับ ดู [[business-logic/synthetic-quality-control/certification-template-version-policy]]
- `revokeCertification(certId: string, reason: string, revokedBy: string): Promise<void>` — ยกเลิกใบรับรองที่ออกไปแล้วถ้าพบปัญหาภายหลัง
- `verifyCertification(certId: string): Promise<VerificationResult>` — ตรวจสอบความถูกต้องของใบรับรองด้วย checksum และตรวจว่ายังไม่ถูก revoke

## ความสัมพันธ์กับ module อื่น

ถ้า batch ยังมี active hold อยู่ใน [[structure/synthetic-quality-control/module-quarantine-manager]] จะปฏิเสธออกใบรับรองทันทีโดยไม่มีข้อยกเว้น แม้ผู้มีอำนาจสั่งมาก็ตาม — ต้อง release hold ก่อนเสมอตาม [[business-logic/synthetic-quality-control/certification-template-version-policy]]
