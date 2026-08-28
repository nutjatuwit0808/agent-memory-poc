---
layer: business-logic
tags: [spc, control-chart, edge-case]
created: 2026-02-13
links:
  - "[[structure/synthetic-quality-control/module-spc-analyzer]]"
  - "[[business-logic/synthetic-quality-control/control-chart-rule-policy]]"
---

# ข้อยกเว้นของนโยบาย Control Chart Rule สำหรับ Process ที่เพิ่งเริ่ม

สำหรับ product line ที่เพิ่งเริ่มเดินสายและยังไม่มีข้อมูลประวัติ 25 จุดตามที่ [[structure/synthetic-quality-control/module-spc-analyzer]] ต้องการ ระบบจะใช้ provisional control limit จาก product line ที่ใกล้เคียงที่สุดชั่วคราว พร้อม flag ทุก result ว่า "provisional" เพื่อให้ QC engineer ทราบว่าตัวเลขยังไม่ stable

เมื่อสะสมข้อมูลครบ 25 จุดแล้ว ระบบจะ recalculate control limit ใหม่จากข้อมูลจริงและลบ flag provisional ออก ไม่มีการ backfill violation เพราะการตัดสินใจในช่วง provisional ถือว่าทำภายใต้ข้อมูลที่มีในขณะนั้น

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-quality-control/control-chart-rule-policy]] ("นโยบาย Western Electric Control Chart Rules") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
