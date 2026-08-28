---
layer: structure
tags: [telematics, drivelog, gateway, api]
created: 2026-07-23
---

# API Gateway

คำขอจากแอปมือถือของผู้ขับเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ token และแนบ policyholder ID ไปกับทุก request ก่อนส่งต่อให้ service ที่เกี่ยวข้อง

อุปกรณ์ OBD-II ส่งข้อมูลเข้ามาผ่าน endpoint แยกที่ใช้ protocol แบบ binary compact เพื่อประหยัด bandwidth เพราะอุปกรณ์บางรุ่นเชื่อมต่อผ่านเครือข่ายมือถือที่มีข้อจำกัดด้านปริมาณข้อมูล
