---
layer: business-logic
tags: [compliance, deadline, leave, edge-case]
created: 2025-09-19
links:
  - "[[business-logic/synthetic-e-learning/mandatory-compliance-deadline-policy]]"
---

# ข้อยกเว้น Compliance Deadline: พนักงานที่ลา

พนักงานที่ลาพักร้อน ลาป่วย หรือลาคลอดในช่วงที่ compliance deadline ตรง สามารถขอ defer deadline ได้โดยให้ HR อนุมัติ ระบบจะ pause reminder และ escalation สำหรับพนักงานนั้นโดยอัตโนมัติตลอดช่วงลา และตั้ง deadline ใหม่หลังวันกลับมาทำงาน

Defer ไม่ได้หมายความว่ายกเว้น compliance requirement — พนักงานยังต้องทำให้เสร็จหลังกลับมา สถานะใน HR report จะแสดงเป็น `deferred` (ไม่ใช่ `non-compliant`) ตลอดช่วงลา เพื่อให้ audit report สะท้อนสถานการณ์จริงไม่ใช่ flag พนักงานที่กำลังลาว่าผิด compliance

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-e-learning/mandatory-compliance-deadline-policy]] ("นโยบาย Deadline สำหรับ Compliance Training บังคับ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
