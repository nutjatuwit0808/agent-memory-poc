---
layer: business-logic
tags: [tagging, registry, policy]
created: 2026-02-15
links:
  - "[[structure/synthetic-asset-management/module-asset-registry]]"
---

# นโยบายการติด Tag สินทรัพย์ทางกายภาพ

สินทรัพย์ทุกชิ้นที่จดทะเบียนใน [[structure/synthetic-asset-management/module-asset-registry]] ต้องมี physical tag (barcode หรือ QR code) ที่พิมพ์จากระบบและติดบนตัวสินทรัพย์ก่อนนำออกจากห้อง receiving — ทีม IT ต้องยืนยัน tag ว่าติดครบก่อนปิด procurement request

asset_id บน tag ต้องตรงกับที่อยู่ใน [[structure/synthetic-asset-management/module-asset-registry]] ทุกตัวอักษร — ถ้าพบว่า tag ผิดหรือหลุดออก ต้องรายงานและพิมพ์ tag ใหม่ผ่านกระบวนการที่มี audit log
