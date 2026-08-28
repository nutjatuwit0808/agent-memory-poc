---
layer: business-logic
tags: [rework, authority, edge-case]
created: 2025-11-27
links:
  - "[[business-logic/synthetic-quality-control/rework-approval-authority-policy]]"
---

# ข้อยกเว้นกรณีผู้ตรวจคนเดียวที่ shift ว่าง

ในกะกลางคืนหรือวันหยุดที่มีผู้ตรวจเพียงคนเดียวในสายนั้น ระบบยังคง enforce ว่าต้องมีผู้อนุมัติคนที่สอง แต่อนุญาตให้ผู้ตรวจจาก product line อื่น (ภายในโรงงานเดียวกัน) เข้ามาทำหน้าที่เป็น second approver ได้แทน

ถ้าไม่มีผู้ตรวจคนที่สองเลยและ batch มี deadline ส่ง QC Manager สามารถอนุมัติ temporary override ผ่าน system ได้ แต่ต้องบันทึกเหตุผลและแจ้งทีม QA ทันทีเพื่อ review ใน audit ถัดไป — ไม่สามารถ override เงียบๆ ได้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-quality-control/rework-approval-authority-policy]] ("นโยบายอำนาจการอนุมัติ Rework") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
