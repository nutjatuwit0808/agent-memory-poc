---
layer: business-logic
tags: [certificate, revocation, policy]
created: 2025-11-15
---

# นโยบายการยกเลิก Certificate

Certificate สามารถถูก revoke ได้ในกรณี: (1) ตรวจพบว่าออก certificate โดยผิดพลาดก่อนเงื่อนไขครบ (2) พบหลักฐาน plagiarism หรือ cheating ในการสอบที่ใช้ขอ certificate นั้น (3) คอร์สนั้น revise เนื้อหาใหม่อย่างมีนัยสำคัญจนความรู้เดิมล้าสมัย

การ revoke ต้องมีหลักฐานและผ่านการอนุมัติจาก compliance officer เสมอ ไม่มีระบบ revoke อัตโนมัติ เพราะผลกระทบต่อผู้เรียนสูงมาก — certificate ที่ถูก revoke จะแสดงสถานะ `revoked` เมื่อมีการ verify แทนที่จะหายไปเพื่อ traceability
