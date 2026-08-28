---
layer: business-logic
tags: [export, format, policy]
created: 2026-02-05
links:
  - "[[structure/synthetic-customer-segmentation/module-channel-exporter]]"
---

# นโยบายรูปแบบ Export File

segment export ทุกชนิดใช้ format เดียวกันคือ JSON Lines (`.jsonl`) ไม่ว่าจะส่งไปยัง channel ใด — แต่ละ line เป็น JSON object ที่มีอย่างน้อย `customer_token` และ `segment_id` ส่วน field เสริมขึ้นกับ channel requirement

[[structure/synthetic-customer-segmentation/module-channel-exporter]] มี adapter ต่อ channel ที่แปลง JSONL เป็น format ที่ channel ต้องการก่อนส่ง เพื่อให้ core export logic ไม่ต้องรู้ channel format ต่างๆ
