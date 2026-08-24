---
layer: deployment
tags: [migration, runbook]
created: 2026-04-08
links:
  - "[[structure/synthetic-travel-booking/module-supplier-sync]]"
---

# Inventory Schema Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อเพิ่มซัพพลายเออร์รายใหม่ที่มีโครงสร้างข้อมูล inventory ต่างจากที่ [[structure/synthetic-travel-booking/module-supplier-sync]] รองรับอยู่เดิม ต้อง migrate schema ของ `supplier_inventory_snapshot` ให้รองรับ field ใหม่โดยไม่กระทบซัพพลายเออร์เดิม

## ขั้นตอน

1) เพิ่มคอลัมน์ใหม่แบบ nullable ก่อนเสมอ ไม่แก้คอลัมน์เดิม 2) deploy parser ที่รองรับทั้ง schema เก่าและใหม่พร้อมกัน 3) sync ทดสอบกับซัพพลายเออร์รายใหม่ในโหมด shadow (ไม่กระทบผลค้นหาจริง) อย่างน้อย 24 ชั่วโมง 4) เปิดใช้งานจริงหลังยืนยันว่าจำนวนห้องว่างตรงกับที่ตรวจสอบด้วยมือ
