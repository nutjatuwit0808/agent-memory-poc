---
layer: business-logic
tags: [pipeline, edge-case]
created: 2026-02-27
links:
  - "[[business-logic/synthetic-recruitment-ats/duplicate-candidate-merge-policy]]"
---

# ข้อยกเว้นเมื่อผู้สมัครซ้ำสมัครคนละตำแหน่งพร้อมกัน

ถ้าผู้สมัครที่ระบบตรวจพบว่าเป็นคนเดียวกันสมัครคนละตำแหน่งพร้อมกัน (คนละ requisition) การ merge record หลักจะไม่กระทบ pipeline stage ของแต่ละตำแหน่ง — แต่ละ requisition ยังคงมี `pipeline_stages` แยกเป็นของตัวเอง มีแค่ข้อมูลผู้สมัครหลัก (ชื่อ, ติดต่อ, resume) ที่ถูกรวมเป็นชุดเดียว

ถ้าตำแหน่งหนึ่งผู้สมัครถูก reject ไปแล้วแต่อีกตำแหน่งยังอยู่ระหว่าง interviewing การ merge จะไม่ทำให้สถานะ reject ลามไปกระทบตำแหน่งที่ยังดำเนินอยู่ เพราะแต่ละ pipeline ตัดสินใจอย่างอิสระจากกัน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-recruitment-ats/duplicate-candidate-merge-policy]] ("นโยบายการรวม Candidate ที่ซ้ำกัน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
