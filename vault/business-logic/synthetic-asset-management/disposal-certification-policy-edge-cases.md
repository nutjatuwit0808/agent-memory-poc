---
layer: business-logic
tags: [disposal, certification, edge-case]
created: 2025-12-26
links:
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
  - "[[structure/synthetic-asset-management/module-disposal-workflow]]"
  - "[[business-logic/synthetic-asset-management/disposal-certification-policy]]"
---

# ข้อยกเว้น: Disposal ของสินทรัพย์ที่ไม่มีข้อมูลสะสม

สินทรัพย์ที่ไม่เคยเก็บข้อมูล เช่น furniture, monitor ที่ไม่มี storage, หรืออุปกรณ์เครือข่าย passive เช่น switch และ cable ไม่จำเป็นต้องมี data destruction certificate — แค่ recycling certificate ตามกฎ e-waste ก็เพียงพอ

ทีม IT ต้อง classify สินทรัพย์ว่า `data-bearing` หรือ `non-data-bearing` ตอนจดทะเบียนใน [[structure/synthetic-asset-management/module-asset-registry]] เพื่อให้ [[structure/synthetic-asset-management/module-disposal-workflow]] รู้ว่าต้องบังคับใบรับรองใดบ้าง — ถ้าไม่ได้ classify ไว้ ระบบจะ default เป็น `data-bearing` เพื่อความปลอดภัย

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-asset-management/disposal-certification-policy]] ("นโยบายใบรับรองที่ต้องมีก่อนปิด Disposal") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
