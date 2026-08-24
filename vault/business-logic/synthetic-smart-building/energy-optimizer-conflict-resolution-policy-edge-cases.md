---
layer: business-logic
tags: [energy, conflict, edge-case]
created: 2026-03-08
links:
  - "[[support-cases/synthetic-smart-building/case-3405]]"
  - "[[business-logic/synthetic-smart-building/energy-optimizer-conflict-resolution-policy]]"
---

# ข้อยกเว้นเมื่อ Manual Override หมดอายุระหว่างที่ Optimizer กำลังจะปรับพอดี

ถ้า manual override หมดอายุพอดีในช่วงเวลาไม่ถึง 1 นาทีก่อนรอบคำนวณถัดไปของ optimizer ระบบจะรอให้ผ่านไปอีกหนึ่งรอบเต็ม (5 นาที) ก่อนเริ่มรับคำแนะนำ auto ใหม่ แทนที่จะรับทันทีที่หมดอายุ เพื่อกันไม่ให้ setpoint เปลี่ยนสองครั้งติดกันในเวลาไล่เลี่ยกันจนคนในห้องรู้สึกได้ถึงความแกว่ง

เคสนี้เป็นบทเรียนตรงจาก [[support-cases/synthetic-smart-building/case-3405]] ที่พบว่าการรับคำแนะนำทันทีที่ override หมดอายุทำให้อุณหภูมิแกว่งขึ้นลงต่อเนื่องหลายรอบก่อนจะนิ่ง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-smart-building/energy-optimizer-conflict-resolution-policy]] ("นโยบายการชนกันระหว่าง Energy Optimizer กับ Manual Override") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
