---
layer: business-logic
tags: [pii, edge-case]
created: 2026-04-03
links:
  - "[[business-logic/synthetic-analytics-pipeline/pii-classification-policy]]"
---

# ข้อยกเว้นเมื่อ PII ปนอยู่ใน Column ประเภท Free-text

column ประเภท free-text (เช่น field แสดงความคิดเห็นของลูกค้า) ไม่สามารถ classify ล่วงหน้าได้แม่นยำเหมือน column ที่มีโครงสร้างชัดเจน เพราะ PII อาจปนอยู่ในเนื้อความโดยไม่สม่ำเสมอ column ประเภทนี้จึงถูกจัดเป็น `high_risk_unstructured` เสมอโดย default และรัน pattern-matching เข้มกว่า column อื่นแม้จะยังไม่เคยพบ PII จริงในนั้นก็ตาม

ถ้าทีมเจ้าของ dataset ยืนยันว่า column free-text ใดไม่มีความเสี่ยง PII จริง (เช่น ผ่านการตรวจสอบเชิงลึกแล้ว) สามารถขอลดระดับจาก `high_risk_unstructured` ได้ แต่ต้องมีการรีวิวซ้ำทุก 6 เดือนเสมอ ไม่ใช่ลดระดับแล้วจบถาวร เพราะเนื้อหาที่ผู้ใช้พิมพ์เข้ามาเปลี่ยนแปลงได้ตลอดเวลา

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-analytics-pipeline/pii-classification-policy]] ("นโยบายจำแนกและจัดการข้อมูล PII") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
