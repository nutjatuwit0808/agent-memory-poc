---
layer: business-logic
tags: [bidding, pmp, edge-case]
created: 2026-02-26
links:
  - "[[business-logic/synthetic-ad-bidding/deal-id-priority-policy]]"
  - "[[business-logic/synthetic-ad-bidding/bid-timeout-policy]]"
---

# ข้อยกเว้น: Deal ID แบบ Private Marketplace (PMP)

bid request ที่มี deal ID ของ PMP (ข้อตกลงราคาที่คุยกันไว้ล่วงหน้ากับผู้ลงโฆษณารายใหญ่) ได้รับ time budget เพิ่มอีก 10ms เพราะ traffic กลุ่มนี้ผ่าน fraud check ที่เข้มงวดกว่าปกติ (ดู [[business-logic/synthetic-ad-bidding/deal-id-priority-policy]]) และทีมยอมรับ trade-off latency เพิ่มเล็กน้อยเพื่อความแม่นยำของ deal เหล่านี้

ถ้า time budget เพิ่มแล้วยังไม่พอ ระบบจะ skip creative variant selection ที่ซับซ้อน (เช่น dynamic creative optimization) แล้วใช้ default variant แทน ดีกว่าพลาด deadline ไปเลยทั้ง request

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-ad-bidding/bid-timeout-policy]] ("นโยบาย Time Budget และ Timeout ของ Bid Request") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
