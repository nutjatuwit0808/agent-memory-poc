---
layer: business-logic
tags: [brand-safety, blocklist, policy]
created: 2025-10-16
links:
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
---

# นโยบาย Blocklist หมวดเนื้อหา (Brand Safety)

ผู้ลงโฆษณาแต่ละรายตั้ง category ของ publisher/content ที่ไม่ต้องการให้โฆษณาตัวเองไปแสดง (brand safety) เช่น เนื้อหาความรุนแรงหรือข่าวลบ — [[structure/synthetic-ad-bidding/module-auction-engine]] กรอง candidate ที่ขัดกับ blocklist ออกก่อนเริ่ม internal auction เสมอ

category ของ content มาจาก metadata ที่ SSP ส่งมาเอง AdPulse ไม่มีระบบตรวจสอบเนื้อหาเองโดยตรง ถ้า SSP ส่ง metadata ผิดหรือไม่ครบ ระบบเลือกที่จะปลอดภัยไว้ก่อน (ไม่ประมูล) มากกว่าเสี่ยงประมูลให้เนื้อหาที่จัดหมวดไม่ชัดเจน
