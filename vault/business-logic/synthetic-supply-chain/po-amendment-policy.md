---
layer: business-logic
tags: [purchase-order, amendment, policy]
created: 2026-06-06
links:
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
---

# นโยบายการแก้ไข Purchase Order ที่ยืนยันแล้ว

PO ที่ซัพพลายเออร์ยืนยันแล้วสามารถแก้ไขได้ แต่ต้องได้รับความเห็นชอบจากซัพพลายเออร์ใหม่ ทุกการแก้ไขถูก version ไว้ใน `po_amendments` table โดย [[structure/synthetic-supply-chain/module-purchase-order-engine]] ห้ามลบ amendment record เพื่อ audit trail ที่สมบูรณ์

การลดจำนวนสั่งซื้อหลังจากที่ซัพพลายเออร์เริ่มผลิตแล้วอาจเกิด cancellation fee ตามที่ระบุในสัญญา ระบบจะแสดง estimated cancellation cost ก่อนให้ยืนยัน amendment เพื่อให้ผู้อนุมัติมีข้อมูลครบก่อนตัดสินใจ
