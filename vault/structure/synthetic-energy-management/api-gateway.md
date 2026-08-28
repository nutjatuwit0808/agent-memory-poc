---
layer: structure
tags: [energy-management, gridsync, gateway, api]
created: 2025-12-30
---

# API Gateway

คำขอจากแอปทีมอาคาร (facility team) เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ token และแนบ facility ID ไปกับทุก request ก่อนส่งต่อให้ service ที่เกี่ยวข้อง

meter ที่ส่งข้อมูลเข้ามาใช้ endpoint แยกที่รับ payload ผ่าน MQTT bridge ไม่ใช่ REST ปกติ เพราะ meter จำนวนมากส่งข้อมูลถี่มากและ REST overhead สูงเกินไปสำหรับ scale นี้
