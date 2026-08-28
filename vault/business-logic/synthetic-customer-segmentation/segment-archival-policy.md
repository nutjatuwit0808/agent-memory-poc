---
layer: business-logic
tags: [lifecycle, archive, policy]
created: 2026-01-17
---

# นโยบายการ Archive Segment ที่ไม่ใช้งาน

segment ที่ไม่มีการ export เกิน 90 วัน และไม่มี active campaign ใช้งาน จะถูก flag อัตโนมัติให้ owner ตัดสินใจว่าจะ archive หรือ keep — ระบบไม่ archive โดยอัตโนมัติโดยไม่มีการยืนยัน

หลัง archive membership refresh จะหยุดทำงานสำหรับ segment นั้น เพื่อลด compute load แต่ definition และ history ยังคงอยู่ในระบบ สามารถ restore ได้ตลอดเวลาโดยไม่สูญหาย
