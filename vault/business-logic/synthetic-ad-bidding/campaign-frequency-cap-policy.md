---
layer: business-logic
tags: [frequency-cap, policy]
created: 2025-12-22
links:
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
---

# นโยบาย Frequency Cap ของแคมเปญ

แต่ละแคมเปญตั้งค่า frequency cap ได้ (เช่น แสดงไม่เกิน 3 ครั้งต่อ user ต่อวัน) [[structure/synthetic-ad-bidding/module-auction-engine]] เช็คค่านี้ก่อนนับแคมเปญเป็น candidate ที่จะเข้าประมูลเลย ไม่ใช่เช็คหลังชนะประมูลแล้ว เพื่อไม่ให้เสียเวลาประมูลแทนแคมเปญที่ชนแล้วก็แสดงไม่ได้

การนับความถี่ใช้ cookie/device ID เป็นหลัก ระบบยอมรับว่าการนับไม่แม่นยำ 100% ในสภาพแวดล้อมที่ cookie ถูกบล็อกหรือ device ID เปลี่ยนบ่อย แต่ยังดีกว่าไม่มีการควบคุมเลย
