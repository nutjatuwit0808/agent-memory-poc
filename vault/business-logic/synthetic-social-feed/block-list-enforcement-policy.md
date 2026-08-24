---
layer: business-logic
tags: [safety, policy]
created: 2025-10-15
---

# นโยบายการบังคับใช้ Block List

ผู้ใช้ที่ถูก block จะไม่เห็นโพสต์ของผู้ block และไม่สามารถ follow/comment ได้ทันทีที่ block มีผล ระบบ propagate การ block ไปทุก service ที่เกี่ยวข้องภายใน 5 วินาที

การ unblock ไม่คืนสถานะ follow เดิมอัตโนมัติ — ถ้าเคย follow กันมาก่อน block ต้องส่งคำขอ follow ใหม่หลัง unblock
