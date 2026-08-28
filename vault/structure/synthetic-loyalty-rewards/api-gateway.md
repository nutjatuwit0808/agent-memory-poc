---
layer: structure
tags: [loyalty-rewards, pointsvault, gateway, api]
created: 2025-10-04
links:
  - "[[structure/synthetic-loyalty-rewards/module-partner-sync]]"
---

# API Gateway

คำขอจาก mobile app และ web portal ของสมาชิกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งทำ auth และแปลง member_id เป็น internal account_id ก่อนส่งต่อให้ service ปลายทาง คำขอที่ต้องการผลทันที เช่น เช็คยอดแต้มปัจจุบัน ใช้ synchronous call ผ่านตรงนี้

คำขอจาก partner brand ผ่าน partner API แยกต่างหาก ไม่ใช่ gateway สมาชิก เพื่อแยก rate limit และ auth scope ของสองฝั่งออกจากกัน [[structure/synthetic-loyalty-rewards/module-partner-sync]] เป็นผู้รับ event จาก partner โดยตรงผ่าน webhook endpoint ของตัวเอง
