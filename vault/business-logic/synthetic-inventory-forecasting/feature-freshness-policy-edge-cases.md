---
layer: business-logic
tags: [feature-store, edge-case]
created: 2026-03-30
links:
  - "[[business-logic/synthetic-inventory-forecasting/feature-freshness-policy]]"
---

# ข้อยกเว้นช่วงวันหยุดยาวที่ source data ล่าช้าตามคาด

ช่วงวันหยุดยาวที่ระบบ POS ต้นทางของลูกค้าบาง site ปิดทำการหรือส่งข้อมูลล่าช้าตามที่แจ้งล่วงหน้า ทีม data engineering สามารถประกาศ "extended freshness window" ชั่วคราวสำหรับ store นั้นได้ เพื่อไม่ให้ทุก SKU ใน store นั้นถูก mark partial โดยไม่จำเป็นทั้งที่รู้อยู่แล้วว่าข้อมูลจะมาช้า

extended window ต้องประกาศล่วงหน้าเป็นลายลักษณ์อักษรเท่านั้น ห้าม infer อัตโนมัติจากการที่ feature ขาดหาย เพราะ feature ขาดหายอาจเป็นปัญหาจริงที่ต้องรู้ตัวเร็ว ไม่ใช่แค่ความล่าช้าที่คาดไว้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-inventory-forecasting/feature-freshness-policy]] ("นโยบายความสดของ Feature") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
