---
layer: business-logic
tags: [feature-store, backfill, policy]
created: 2026-03-20
links:
  - "[[business-logic/synthetic-inventory-forecasting/forecast-override-policy]]"
---

# นโยบายการ Backfill ข้อมูลย้อนหลัง

งาน backfill (เช่น แก้ feature ย้อนหลังหลังพบ bug ในสูตรคำนวณ) ต้องรันผ่าน dedicated backfill job เท่านั้น ห้าม UPDATE ตารางตรงๆ ด้วยมือ เพื่อให้มี audit trail ว่า backfill ไหนแก้อะไรไปบ้าง

backfill job ต้อง exclude แถวที่มี `source = "analyst_override"` ใน `replenishment_recommendations` เสมอตามที่ระบุใน [[business-logic/synthetic-inventory-forecasting/forecast-override-policy]] — เป็นเงื่อนไขบังคับที่ script backfill ทุกตัวต้องเช็คก่อนเขียนทับ
