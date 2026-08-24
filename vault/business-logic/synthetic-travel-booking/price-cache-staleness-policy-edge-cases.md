---
layer: business-logic
tags: [pricing, cache, edge-case]
created: 2026-05-26
links:
  - "[[structure/synthetic-travel-booking/module-supplier-sync]]"
  - "[[business-logic/synthetic-travel-booking/price-cache-staleness-policy]]"
---

# ข้อยกเว้นระหว่างซัพพลายเออร์รายงานสถานะ Degraded

ถ้าซัพพลายเออร์ถูก [[structure/synthetic-travel-booking/module-supplier-sync]] mark เป็น degraded (sync ล้มเหลวต่อเนื่อง) ราคาที่ cache ไว้ของซัพพลายเออร์นั้นจะไม่ถูกใช้แสดงผลอีกแม้จะยังไม่หมด grace period ตามปกติ — ตัดออกจากผลค้นหาไปเลยจนกว่าจะ sync สำเร็จอีกครั้ง เพราะความเสี่ยงราคาผิดสูงเกินกว่าจะยอมรับได้

กรณีนี้ต่างจาก staleness ปกติตรงที่ไม่ใช่แค่ "ราคาเก่า" แต่คือ "ไม่รู้เลยว่าราคาปัจจุบันคืออะไร" — สองสถานการณ์นี้ทีมแยกจัดการชัดเจนเพื่อไม่ให้ปนกัน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-travel-booking/price-cache-staleness-policy]] ("นโยบายการยอมรับความล้าสมัยของ Price Cache") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
