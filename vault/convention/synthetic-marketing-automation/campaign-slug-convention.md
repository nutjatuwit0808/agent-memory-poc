---
layer: convention
tags: [campaign, naming]
created: 2026-03-14
---

# Campaign Slug Convention

ทุก campaign ต้องมี slug ที่อ่านรู้เรื่องสำหรับทีม marketing เอง ไม่ใช่แค่ UUID ภายใน เพราะต้องใช้อ้างอิงกันในรายงานและการสื่อสารข้ามทีมบ่อยมาก

## รูปแบบ

`<ปี>-<เดือน>-<ประเภท>-<คำอธิบายสั้น>` เช่น `2026-08-newsletter-summer-sale`, `2026-08-transactional-cart-reminder`

## ข้อห้าม

ห้ามใช้ชื่อ segment เป้าหมายเป็นส่วนหนึ่งของ slug (เช่น ห้ามชื่อ `2026-08-vip-customers-promo`) เพราะ segment ที่ผูกกับ campaign อาจเปลี่ยนได้ภายหลังแต่ slug ควรอ้างอิงเนื้อหา ไม่ใช่กลุ่มเป้าหมาย
