---
layer: business-logic
tags: [disposal, exception, edge-case]
created: 2026-05-24
links:
  - "[[structure/synthetic-asset-management/module-disposal-workflow]]"
  - "[[business-logic/synthetic-asset-management/asset-minimum-useful-life-policy]]"
---

# ข้อยกเว้น: Dispose ก่อนอายุขั้นต่ำด้วยเหตุผลพิเศษ

สินทรัพย์ที่เสียหายจนซ่อมไม่คุ้มหรือถูกขโมยสามารถ dispose ก่อนอายุขั้นต่ำได้ แต่ต้องมีเอกสารประกอบ ได้แก่ ใบประเมินความเสียหายจากทีมซ่อม หรือใบแจ้งความ — [[structure/synthetic-asset-management/module-disposal-workflow]] จะให้เลือก reason `damaged` หรือ `stolen` ซึ่งจะ bypass การตรวจสอบอายุขั้นต่ำ

Disposal ที่ bypass อายุขั้นต่ำทุกกรณีจะถูก flag ให้ทีม finance review โดยอัตโนมัติ เพื่อปรับ depreciation schedule ที่ค้างอยู่ให้สอดคล้องกับ asset ที่หายออกจากบัญชีก่อนเวลา

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-asset-management/asset-minimum-useful-life-policy]] ("นโยบายอายุการใช้งานขั้นต่ำก่อน Dispose") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
