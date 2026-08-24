---
layer: business-logic
tags: [pipeline, edge-case]
created: 2025-09-06
links:
  - "[[support-cases/synthetic-recruitment-ats/case-3307]]"
  - "[[business-logic/synthetic-recruitment-ats/pipeline-auto-advance-policy]]"
---

# ข้อยกเว้นเมื่อผลสัมภาษณ์มาไม่ครบทุกคนแต่ Timeout

ถ้า interviewer บางคนไม่กรอกผลสัมภาษณ์ภายใน 48 ชั่วโมงหลังสัมภาษณ์เสร็จ ระบบจะไม่ auto-advance ผู้สมัครไปขั้นถัดไปทั้งที่ผลที่มีอยู่เป็นบวกทั้งหมด — จะคงสถานะเดิมไว้และแจ้งเตือน interviewer ที่ยังไม่กรอกซ้ำแทน เพราะการ auto-advance จากผลไม่ครบอาจข้ามความเห็นสำคัญของคนที่ยังไม่ได้กรอกไป

recruiter มีสิทธิ์ override เพื่อ advance ด้วยมือได้ถ้าตัดสินใจว่าผลที่มีอยู่เพียงพอแล้ว แต่การ override แบบนี้จะถูกบันทึกไว้ต่างหากจาก auto-advance ปกติเพื่อ audit — บทเรียนจาก [[support-cases/synthetic-recruitment-ats/case-3307]] คือทิศทางตรงข้าม (auto-reject ทั้งที่ควรผ่าน) อันตรายกว่า auto-advance เร็วเกินไปมาก

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-recruitment-ats/pipeline-auto-advance-policy]] ("นโยบายการเลื่อนขั้น Pipeline อัตโนมัติ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
