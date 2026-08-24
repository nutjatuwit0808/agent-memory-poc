---
layer: structure
tags: [reminder, module]
created: 2025-12-24
links:
  - "[[structure/synthetic-document-signing/module-signature-capture]]"
  - "[[business-logic/synthetic-document-signing/reminder-frequency-policy]]"
---

# Module: reminder-scheduler

ส่งอีเมล/SMS เตือน signer ที่ยังไม่ถึงตาเซ็นหรือถึงตาแล้วแต่ยังไม่ดำเนินการ ตามตารางเวลาที่กำหนด ต้องยกเลิกการเตือนที่ตั้งไว้ทันทีเมื่อ signer เซ็นเสร็จแล้ว ไม่งั้นจะกลายเป็นสแปมที่ทำลายความน่าเชื่อถือของแพลตฟอร์ม

## ฟังก์ชันหลัก
- `scheduleReminder(envelopeId: string, signerId: string, sendAt: string): Promise<string>` — ตั้งเตือนล่วงหน้าสำหรับ signer คนหนึ่ง คืน reminderId
- `cancelRemindersForSigner(envelopeId: string, signerId: string): Promise<void>` — ยกเลิกเตือนที่ยังไม่ส่งทั้งหมดของ signer คนนี้ใน envelope นี้
- `sendDueReminders(): Promise<number>` — ส่งเตือนทั้งหมดที่ถึงกำหนดเวลาแล้ว รันเป็น scheduled job รายชั่วโมง คืนจำนวนที่ส่งสำเร็จ

## ความสัมพันธ์กับ module อื่น

subscribe event `signer.completed` จาก [[structure/synthetic-document-signing/module-signature-capture]] เพื่อเรียก `cancelRemindersForSigner` โดยอัตโนมัติทันทีที่ signer เซ็นเสร็จ — ความถี่และจำนวนครั้งสูงสุดของการเตือนกำหนดโดย [[business-logic/synthetic-document-signing/reminder-frequency-policy]]
