---
layer: business-logic
tags: [background-check, edge-case]
created: 2026-06-08
links:
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
  - "[[business-logic/synthetic-hr-onboarding/background-check-gating-policy]]"
---

# ข้อยกเว้นสำหรับตำแหน่งที่ไม่บังคับตรวจประวัติ

ตำแหน่งบาง role (เช่น พนักงาน contract ระยะสั้นที่ไม่แตะข้อมูลลูกค้าหรือระบบ production) ไม่ต้องผ่าน background check เลยตามนโยบายบริษัท — [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]] จะข้าม stage `background_check_pending` ไปเลยสำหรับ role กลุ่มนี้ ไม่ใช่รอให้ status เป็น `not_required` เหมือน role ทั่วไป

ถ้า role ของพนักงานถูกเปลี่ยนระหว่างที่ onboarding case ยังไม่จบ (เช่น เปลี่ยนจาก contractor เป็น full-time) ระบบจะประเมินใหม่ทันทีว่าต้องเริ่ม background check หรือไม่ แม้ case จะผ่าน stage นั้นไปแล้วก็ตาม

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-hr-onboarding/background-check-gating-policy]] ("นโยบายการกันวันเริ่มงานด้วยผลตรวจประวัติ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
