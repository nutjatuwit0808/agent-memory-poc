---
layer: business-logic
tags: [depreciation, correction, edge-case]
created: 2026-08-16
links:
  - "[[structure/synthetic-asset-management/module-depreciation-engine]]"
  - "[[business-logic/synthetic-asset-management/depreciation-method-policy]]"
---

# ข้อยกเว้นเมื่อ Depreciation Schedule ถูกสร้างด้วยวันเริ่มต้นผิด

ถ้าพบว่า schedule ถูกสร้างด้วย `startDate` ที่ผิด (เช่น ใช้วันที่ซื้อ PO แทนวันที่รับสินทรัพย์จริง) ต้องเรียก `recomputeSchedule` ผ่าน [[structure/synthetic-asset-management/module-depreciation-engine]] พร้อม `correctedStartDate` ที่ถูกต้อง — ห้ามแก้ตาราง schedule โดยตรง

การ recompute ต้องได้รับอนุมัติจากทีม finance ก่อนเสมอ เพราะเปลี่ยนตัวเลขที่ถูก book ไปแล้วในบัญชี ถ้า recompute หลังจาก fiscal year ปิดแล้ว ต้องใช้กระบวนการ audit adjustment แยกต่างหากแทนที่จะ recompute โดยตรง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-asset-management/depreciation-method-policy]] ("นโยบายการเลือก Depreciation Method สำหรับสินทรัพย์") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
