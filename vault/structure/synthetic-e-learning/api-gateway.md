---
layer: structure
tags: [e-learning, learnpath, gateway, api]
created: 2026-05-10
---

# API Gateway

คำขอจากผู้เรียน instructor และ HR admin เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งทำหน้าที่ authenticate และ route ไปยัง service ที่เกี่ยวข้อง คำขอที่เกี่ยวกับ progress และ quiz ผ่านทาง synchronous call เพราะผู้เรียนต้องรอผลทันที

Event ที่เกิดจากผู้เรียนทำกิจกรรม เช่น เปิด video บทเรียน ส่งคำตอบ quiz หรือ request certificate ถูกส่งผ่าน event queue เพื่อให้ service ที่เกี่ยวข้องประมวลผล async ลด latency ที่ผู้เรียนรู้สึก
