---
layer: business-logic
tags: [provisioning, role, policy]
created: 2026-04-27
---

# นโยบายระดับสิทธิ์การเข้าถึงตาม Role

แต่ละ role มี `accessBundleId` ที่กำหนดไว้ล่วงหน้าตายตัว — HR ไม่สามารถเลือก software license แยกทีละตัวให้พนักงานใหม่ผ่าน OnboardFlow ได้ ต้องเป็นชุดที่ approve ไว้แล้วเท่านั้น เพื่อลดความเสี่ยงการให้สิทธิ์เกินจำเป็น

การขอสิทธิ์เพิ่มเติมนอกเหนือจาก bundle มาตรฐานต้องทำผ่านระบบ IT ticketing โดยตรงหลังพนักงานเริ่มงานแล้วเท่านั้น ไม่ใช่ผ่าน OnboardFlow
