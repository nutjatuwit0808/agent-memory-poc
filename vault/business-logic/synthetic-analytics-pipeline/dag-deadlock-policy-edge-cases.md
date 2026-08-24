---
layer: business-logic
tags: [orchestration, edge-case]
created: 2026-05-01
links:
  - "[[business-logic/synthetic-analytics-pipeline/dag-deadlock-policy]]"
---

# ข้อยกเว้นเมื่อ Config เปลี่ยนแล้วสร้าง Dependency วนกลับโดยไม่ตั้งใจ

ถ้าการเปลี่ยน config ของ DAG ที่มีอยู่แล้วสร้าง circular dependency ขึ้นมาใหม่ (เช่น เพิ่ม dependency ย้อนกลับไปหา job ต้นทางของตัวเองโดยไม่ตั้งใจ) ระบบจะปฏิเสธการบันทึก config ใหม่ตั้งแต่ตอน validate ไม่รอให้ถึงรอบ `scheduleDag` จริง เพื่อจับปัญหาให้เร็วที่สุดตั้งแต่ตอน review

DAG ที่ import มาจากระบบเก่าซึ่งมีวงจรอยู่แล้วก่อนใช้ DataFlow (migration case) จะถูกปฏิเสธเช่นกัน ไม่มีข้อยกเว้นให้ import ทั้งที่รู้ว่ามีวงจร — ต้องแก้ไขโครงสร้าง dependency ให้ถูกต้องก่อน migrate เข้ามาเสมอ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-analytics-pipeline/dag-deadlock-policy]] ("นโยบายจัดการ DAG Deadlock") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
