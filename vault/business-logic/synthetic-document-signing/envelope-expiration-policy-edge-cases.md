---
layer: business-logic
tags: [envelope, expiration, edge-case]
created: 2026-07-06
links:
  - "[[business-logic/synthetic-document-signing/envelope-expiration-policy]]"
---

# ข้อยกเว้นเมื่อต้องขยายวันหมดอายุหลัง Envelope Sent แล้ว

ผู้สร้าง envelope สามารถขยายวันหมดอายุได้หลังส่งไปแล้ว แต่การขยายแต่ละครั้งต้องบันทึกเป็น audit event `expiration_extended` พร้อมเหตุผลเสมอ — ไม่ใช่แค่แก้ค่า `expiresAt` เงียบๆ เพราะการขยายวันหมดอายุกระทบสิทธิ์ของ signer ที่ยังไม่เซ็นโดยตรง

envelope ที่หมดอายุไปแล้วไม่สามารถขยายย้อนหลังได้ ต้องสร้าง envelope ใหม่แทนเสมอ เพื่อไม่ให้เกิดคำถามว่าลายเซ็นที่เซ็นหลังหมดอายุ (ถ้าเกิดขึ้นจาก bug) นับเป็นถูกต้องหรือไม่ — การสร้างใหม่ตัดปัญหานี้ทิ้งไปตั้งแต่ต้น

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-document-signing/envelope-expiration-policy]] ("นโยบายวันหมดอายุของ Envelope") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
