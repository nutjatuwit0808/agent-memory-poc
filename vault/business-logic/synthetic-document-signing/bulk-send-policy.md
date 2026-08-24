---
layer: business-logic
tags: [bulk-send, policy]
created: 2026-08-18
---

# นโยบายการส่ง Envelope แบบชุด (Bulk Send)

การส่ง envelope จาก template เดียวกันให้ signer หลายชุดพร้อมกัน (เช่น ส่งสัญญาจ้างให้พนักงานใหม่ 50 คน) ต้องสร้างเป็น envelope แยกกันทุกชุด ไม่ใช่ envelope เดียวที่มี signer หลายกลุ่ม เพื่อไม่ให้ audit trail ของแต่ละคนปนกัน

ถ้าบาง envelope ใน batch ล้มเหลวตอนสร้าง (เช่น อีเมลผิดรูปแบบ) envelope อื่นที่สร้างสำเร็จต้องยังคงถูกส่งตามปกติ ไม่ยกเลิกทั้ง batch เพราะบาง record ผิดพลาด
