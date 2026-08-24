---
layer: business-logic
tags: [replenishment, emergency, edge-case]
created: 2026-08-12
links:
  - "[[business-logic/synthetic-inventory-forecasting/replenishment-approval-policy]]"
---

# ข้อยกเว้นกรณีสินค้าใกล้ขาดสต็อกฉุกเฉิน (Emergency Stockout)

SKU ที่ inventory position ปัจจุบันต่ำกว่า 2 วันของยอดขายเฉลี่ย (ใกล้ขาดสต็อก) จะข้ามขั้นตอนอนุมัติแม้มูลค่าจะเกิน threshold — ส่งตรงไป `sent_to_supplier` ทันทีเพื่อลดความเสี่ยงขาดสต็อกให้เร็วที่สุด

คำแนะนำที่ข้ามการอนุมัติแบบนี้ต้องถูกตรวจสอบย้อนหลัง (post-hoc review) โดยผู้จัดการภายใน 24 ชั่วโมงเสมอ ถ้าพบว่าไม่สมเหตุสมผลย้อนหลังสามารถยกเลิก PO กับ supplier ได้ทันทีถ้ายังไม่ถูกยืนยันฝั่ง supplier

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-inventory-forecasting/replenishment-approval-policy]] ("นโยบายการอนุมัติคำแนะนำเติมสินค้า") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
