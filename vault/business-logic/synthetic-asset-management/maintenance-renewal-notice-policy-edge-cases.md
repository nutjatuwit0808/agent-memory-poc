---
layer: business-logic
tags: [maintenance, disposal, edge-case]
created: 2025-11-01
links:
  - "[[structure/synthetic-asset-management/module-disposal-workflow]]"
  - "[[business-logic/synthetic-asset-management/maintenance-renewal-notice-policy]]"
---

# ข้อยกเว้น: สัญญาบำรุงรักษาที่ผูกกับสินทรัพย์ที่กำลัง Dispose

ถ้าสินทรัพย์อยู่ระหว่างกระบวนการ disposal ใน [[structure/synthetic-asset-management/module-disposal-workflow]] และสัญญาบำรุงรักษาของมันใกล้หมดพร้อมกัน ระบบจะระงับการแจ้งเตือนต่อสัญญาทั้งหมดโดยอัตโนมัติ เพื่อไม่ให้ทีม IT เสียเวลา renew สัญญาของสินทรัพย์ที่กำลังจะ dispose อยู่แล้ว

ถ้า disposal process ล่าช้าและสัญญาหมดก่อน disposal เสร็จ ทีม IT ต้องตัดสินใจด้วยมือว่าจะ renew แบบระยะสั้นหรือปล่อยให้สัญญาขาด — ระบบจะไม่ renew ให้โดยอัตโนมัติในสถานการณ์นี้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-asset-management/maintenance-renewal-notice-policy]] ("นโยบายการแจ้งเตือนต่อสัญญาบำรุงรักษา") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
