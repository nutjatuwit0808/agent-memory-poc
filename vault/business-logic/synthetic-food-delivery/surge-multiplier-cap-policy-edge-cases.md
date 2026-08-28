---
layer: business-logic
tags: [pricing, surge, emergency, edge-case]
created: 2026-04-24
links:
  - "[[business-logic/synthetic-food-delivery/surge-multiplier-cap-policy]]"
---

# Surge Cap พิเศษในกรณีภัยพิบัติหรือเหตุฉุกเฉินสาธารณะ

ในช่วงภัยพิบัติหรือเหตุฉุกเฉินที่ประกาศเป็นทางการ (ดูจาก government API ที่ระบบ integrate ไว้) surge multiplier จะถูก lock ที่ 1.0 โดยอัตโนมัติ ทั่วพื้นที่ที่ได้รับผลกระทบ ไม่ว่า supply/demand ratio จะเป็นเท่าไหร่ก็ตาม

การ override ค่านี้ด้วยมือระหว่างภาวะฉุกเฉินต้องมีการบันทึกเหตุผลและผู้อนุมัติชัดเจนใน audit log โดย system ไม่มีปุ่ม override ที่ UI ปกติ — ต้องทำผ่าน ops console ที่มีการ log ทุก action

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-food-delivery/surge-multiplier-cap-policy]] ("นโยบาย Cap ของ Surge Multiplier") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
