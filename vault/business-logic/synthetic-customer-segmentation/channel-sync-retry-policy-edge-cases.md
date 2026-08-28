---
layer: business-logic
tags: [export, outage, edge-case]
created: 2026-08-08
links:
  - "[[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]]"
---

# ข้อยกเว้น: Export ล้มเหลวทุก Channel พร้อมกัน

ถ้า export ล้มเหลวพร้อมกันมากกว่า 3 channel ใน 30 นาที ระบบจะ assume ว่าเป็น systemic issue (เช่น network หรือ credential rotation) ไม่ใช่ channel เฉพาะ และหยุด retry ทุก channel ชั่วคราว 2 ชั่วโมงก่อนลองใหม่

ระหว่าง 2 ชั่วโมงนั้น on-call engineer จะได้รับ alert ให้ตรวจสอบ ถ้า confirm ว่าปัญหาแก้แล้วก่อนครบ 2 ชั่วโมง สามารถ manual trigger retry ได้ผ่าน admin API โดยไม่ต้องรอ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-customer-segmentation/channel-sync-retry-policy]] ("นโยบาย Channel Sync Retry Limit") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
