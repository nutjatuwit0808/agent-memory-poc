---
layer: business-logic
tags: [intent, confidence, edge-case]
created: 2026-07-13
links:
  - "[[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy]]"
---

# ข้อยกเว้นสำหรับ Intent กลุ่มความเสี่ยงสูง

intent ที่จัดกลุ่มเป็น `high_risk` (เช่น เรื่องร้องเรียนรุนแรง, เรื่องที่เกี่ยวกับความปลอดภัยบัญชี) จะใช้ threshold สูงกว่าปกติที่ 0.85 แม้ค่า global จะตั้งไว้ต่ำกว่านั้น เพราะความเสี่ยงจากการตอบผิด intent กลุ่มนี้สูงกว่าความเสี่ยงจากการส่งต่อเจ้าหน้าที่โดยไม่จำเป็น

ถ้าข้อความมีคำที่อยู่ใน keyword list ความเสี่ยงสูง (เช่นคำที่บ่งบอกอันตรายต่อตัวเอง) ระบบจะส่งต่อเจ้าหน้าที่ทันทีโดยไม่สนใจค่า confidence เลย ไม่ว่าโมเดลจะมั่นใจแค่ไหนก็ตาม

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-chat-support-bot/intent-confidence-threshold-policy]] ("นโยบายเกณฑ์ Confidence ของการจำแนก Intent") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
