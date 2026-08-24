---
layer: structure
tags: [template, module]
created: 2025-12-27
links:
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[structure/synthetic-marketing-automation/module-campaign-builder]]"
---

# Module: template-renderer

แปลง template (HTML + variable placeholder เช่น `{{firstName}}`) เป็นเนื้อหาจริงต่อผู้รับแต่ละคนตอนใกล้เวลาส่ง ไม่ render ล่วงหน้าทั้งหมดตอนสร้าง campaign เพราะ segment ขนาดใหญ่จะกิน storage มหาศาลถ้าเก็บ HTML แยกทุกคน

## ฟังก์ชันหลัก
- `renderForContact(templateId: string, contactId: string): Promise<string>` — render HTML สุดท้ายสำหรับผู้รับคนเดียว แทนที่ placeholder ด้วยข้อมูลจริง
- `validateTemplateSyntax(templateId: string): Promise<TemplateValidationResult>` — ตรวจ syntax placeholder ก่อนบันทึก template ใหม่ ป้องกัน placeholder พิมพ์ผิดหลุดไปถึงลูกค้า

## ความสัมพันธ์กับ module อื่น

ถูกเรียกโดย [[structure/synthetic-marketing-automation/module-send-scheduler]] ตอน `dispatchNextBatch` เท่านั้น ไม่ถูกเรียกตรงจาก [[structure/synthetic-marketing-automation/module-campaign-builder]] ยกเว้นตอน preview ซึ่งใช้ contact ตัวอย่างสมมติ ไม่ใช่ contact จริง
