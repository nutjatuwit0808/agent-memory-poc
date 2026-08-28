---
layer: convention
tags: [naming, batch]
created: 2025-10-06
---

# Batch ID Format

## รูปแบบ

`QP-<YYYYMMDD>-<เลขลำดับ 3 หลัก>` เช่น `QP-20240901-014` วันที่คือวันที่เปิด production run ไม่ใช่วันที่ finish

## กติกา

เลขลำดับ reset เป็น 001 ทุกวัน batch ที่ถูก split ออกจาก batch หลักใช้ suffix `-A`, `-B` เช่น `QP-20240901-014-A` เพื่อให้ traceability ยังเชื่อมกลับต้นทางได้
