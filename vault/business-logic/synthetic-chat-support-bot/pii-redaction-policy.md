---
layer: business-logic
tags: [pii, privacy, policy]
created: 2026-02-11
links:
  - "[[structure/synthetic-chat-support-bot/module-conversation-state-manager]]"
  - "[[support-cases/synthetic-chat-support-bot/case-9777]]"
---

# นโยบายการปกปิดข้อมูลส่วนบุคคล (PII)

ข้อความที่ตรวจพบรูปแบบข้อมูลอ่อนไหว (เลขบัตร, รหัสผ่าน, OTP) จะถูก [[structure/synthetic-chat-support-bot/module-conversation-state-manager]] แทนที่ด้วยเครื่องหมาย mask ก่อนบันทึกลง log ถาวรเสมอ แม้ในหน้าจอที่เจ้าหน้าที่เห็นแบบ real-time จะยังเห็นข้อความเต็มเพื่อช่วยเหลือลูกค้าได้ก็ตาม

bot ต้องไม่ echo ข้อความที่มีรูปแบบ PII กลับไปหาลูกค้าโดยตรงไม่ว่ากรณีใด แม้จะเป็นการยืนยันสิ่งที่ลูกค้าเพิ่งพิมพ์มาก็ตาม — บทเรียนจาก [[support-cases/synthetic-chat-support-bot/case-9777]]
