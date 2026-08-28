---
layer: structure
tags: [event-ticketing, ticketnode, gateway, api]
created: 2026-07-17
---

# API Gateway

คำขอจากแอปผู้ซื้อบัตรเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งจำกัด rate limit ต่อผู้ใช้อย่างเข้มงวดช่วงเปิดขายบัตรเพื่อป้องกัน bot กว้านซื้อบัตร

คำขอจากเครื่องสแกนบัตรหน้างานใช้ endpoint แยกที่ optimize สำหรับ latency ต่ำที่สุด เพราะแถวเข้างานยาวมากช่วงก่อนเริ่มงานและการสแกนช้าแม้ 1-2 วินาทีต่อคนก็สะสมเป็นแถวยาวได้
