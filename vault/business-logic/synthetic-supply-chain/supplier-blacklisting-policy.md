---
layer: business-logic
tags: [supplier, blacklist, policy]
created: 2026-05-11
links:
  - "[[structure/synthetic-supply-chain/module-supplier-catalog]]"
  - "[[structure/synthetic-supply-chain/module-purchase-order-engine]]"
  - "[[business-logic/synthetic-supply-chain/supplier-blacklisting-policy-edge-cases]]"
---

# นโยบายการขึ้น Blacklist ซัพพลายเออร์

ซัพพลายเออร์จะถูก blacklist เมื่อ performance score ต่ำกว่า 40 คะแนน (จาก 100) ติดต่อกัน 2 ไตรมาส หรือมีเหตุการณ์ร้ายแรงเพียงครั้งเดียว เช่น ส่งสินค้าปลอม หรือฝ่าฝืน compliance ด้านแรงงาน การ blacklist ต้องมีหลักฐานเอกสารและผ่านการอนุมัติจาก procurement director

เมื่อ blacklist แล้ว [[structure/synthetic-supply-chain/module-supplier-catalog]] จะ flag ซัพพลายเออร์นั้นทันทีและ [[structure/synthetic-supply-chain/module-purchase-order-engine]] จะปฏิเสธ PO ใหม่ที่ระบุซัพพลายเออร์นั้นโดยอัตโนมัติ PO ที่อยู่ระหว่างดำเนินการยังคงดำเนินต่อไปจนจบ (ไม่ยกเลิกกลางคัน) แต่ห้ามสร้าง PO ใหม่

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-supply-chain/supplier-blacklisting-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
