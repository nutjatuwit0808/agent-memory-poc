---
layer: business-logic
tags: [geo, restriction, edge-node, edge-case]
created: 2026-08-13
links:
  - "[[support-cases/synthetic-content-delivery/case-3682]]"
  - "[[business-logic/synthetic-content-delivery/geo-restriction-policy]]"
---

# ข้อยกเว้น: Geo-Restriction และ CDN Edge Node ในประเทศที่ถูกบล็อก

EdgeServe มี edge node ตั้งอยู่ในบางประเทศที่ tenant บางรายอาจตั้ง geo-restriction ไว้ด้วย — นี่ไม่ได้หมายความว่า request จะผ่านได้เพราะ edge node อยู่ "ในประเทศนั้น" ระบบ enforce rule ตาม IP ต้นทางของ client ไม่ใช่ IP ของ edge node ที่รับ request

แต่มีข้อยกเว้นเดียว: request จาก edge node ด้วยกันเอง (เช่น edge-to-edge replication) จะถูก whitelist อัตโนมัติเพื่อให้ geo-restriction rule ไม่บล็อก content replication ที่ต้องการ ดู [[support-cases/synthetic-content-delivery/case-3682]] สำหรับกรณีที่ whitelist นี้กว้างเกินไปจนทำให้ bypass ได้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-content-delivery/geo-restriction-policy]] ("นโยบายการบังคับ Geo-Restriction") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
