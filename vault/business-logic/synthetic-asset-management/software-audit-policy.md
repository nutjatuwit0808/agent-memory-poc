---
layer: business-logic
tags: [license, audit, policy]
created: 2025-09-13
links:
  - "[[structure/synthetic-asset-management/module-license-pool-manager]]"
---

# นโยบายการ Audit Software License ประจำไตรมาส

ทุกไตรมาส [[structure/synthetic-asset-management/module-license-pool-manager]] จะ trigger การ sync ตัวเลข seat กับทุก vendor portal โดยอัตโนมัติ แล้วสร้างรายงาน utilization สำหรับทีม IT procurement เพื่อวางแผนต่อ license หรือลด subscription ที่ใช้น้อย

License title ที่มี utilization ต่ำกว่า 40% ติดต่อกัน 2 ไตรมาสจะถูก flag ให้ทบทวนว่ายังจำเป็นต้องต่อหรือไม่ ก่อน renewal deadline ถัดไป
