---
layer: structure
tags: [document-signing, signflow, gateway, api]
created: 2025-09-06
links:
  - "[[structure/synthetic-document-signing/module-envelope-builder]]"
  - "[[structure/synthetic-document-signing/module-notary-integration]]"
---

# API Gateway

คำขอจากแอปฝั่งผู้ใช้ (เว็บ/มือถือ) เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลงคำขอ "ดู envelope นี้" หรือ "ส่ง envelope นี้" เป็น call ไปยัง [[structure/synthetic-document-signing/module-envelope-builder]] คำขอที่ต้องการผลลัพธ์ทันที เช่น เช็คสถานะ envelope ปัจจุบัน ใช้ synchronous call ตรงนี้

webhook callback จาก [[structure/synthetic-document-signing/module-notary-integration]] ไม่ผ่าน API gateway ตัวนี้ — มี endpoint แยกที่ verify signature ของ webhook เองโดยเฉพาะ เพราะ payload มาจากระบบภายนอกที่ไม่ได้ authenticate ด้วยกลไกเดียวกับผู้ใช้ทั่วไป การรวม endpoint ปนกันจะเพิ่มความเสี่ยงด้าน security โดยไม่จำเป็น
