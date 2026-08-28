---
layer: business-logic
tags: [cache, ttl, live-stream, edge-case]
created: 2025-10-16
links:
  - "[[support-cases/synthetic-content-delivery/case-7248]]"
  - "[[business-logic/synthetic-content-delivery/cache-ttl-policy]]"
---

# ข้อยกเว้นของนโยบาย Cache TTL: Live Streaming Content

สำหรับ live streaming ที่ใช้ HLS หรือ DASH protocol ไฟล์ manifest และ segment ต้องได้รับ TTL พิเศษที่สั้นกว่าปกติมาก — manifest อยู่ที่ 2 วินาที และ segment อยู่ที่ 3-4 วินาทีหรือตามความยาว segment จริง ซึ่งสั้นกว่า default 30 วินาทีมาก เพื่อให้ผู้ชมได้รับ segment ล่าสุดเกือบ real-time

ถ้า tenant เปิดใช้งาน live mode แต่ไม่ได้แจ้ง EdgeServe ล่วงหน้า content จะถูก cache ด้วย TTL ปกติ ทำให้ผู้ชมติดอยู่กับ manifest เก่าและเห็น stream หยุดนิ่ง — ดู [[support-cases/synthetic-content-delivery/case-7248]] สำหรับกรณีที่เกิดขึ้นจริง ต้อง flag stream เป็น `live: true` ใน tenant config ก่อนใช้งาน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-content-delivery/cache-ttl-policy]] ("นโยบาย Cache TTL ตาม Content Type") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
