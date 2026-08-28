---
layer: business-logic
tags: [case-management, sla, overflow, edge-case]
created: 2025-10-04
links:
  - "[[structure/synthetic-fraud-detection/module-case-manager]]"
  - "[[business-logic/synthetic-fraud-detection/analyst-review-sla-policy]]"
---

# SLA กรณี Queue Overflow ระหว่าง Security Incident ขนาดใหญ่

ถ้า [[structure/synthetic-fraud-detection/module-case-manager]] ตรวจพบว่า case volume เพิ่มขึ้นเกิน 300% ของ baseline ภายใน 30 นาที (สัญญาณของ coordinated attack) ระบบจะเข้าสู่ triage mode: case ใหม่ที่ score ต่ำกว่า 70 จะถูก auto-hold โดยไม่ส่ง reviewer alert เพื่อไม่ให้ queue ล้น

ในช่วง triage mode การ block decision ยังทำงานปกติสำหรับ score ≥ 80 — เฉพาะ review queue เท่านั้นที่ถูก throttle ดังนั้น protection ระดับ hard block ยังคงมีผลอยู่เสมอ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fraud-detection/analyst-review-sla-policy]] ("นโยบาย SLA การ Review Case ของ Analyst") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
