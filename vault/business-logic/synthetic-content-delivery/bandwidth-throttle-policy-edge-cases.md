---
layer: business-logic
tags: [bandwidth, throttle, viral, edge-case]
created: 2025-12-19
links:
  - "[[business-logic/synthetic-content-delivery/bandwidth-throttle-policy]]"
---

# ข้อยกเว้น: Traffic Spike จาก Viral Content

ถ้า tenant ใช้ bandwidth พุ่งขึ้นเร็วผิดปกติภายในเวลาสั้น (ตรวจจับจาก rate-of-change แทนที่จะเป็น absolute value) และ pattern ตรงกับ viral content spread — เช่น request จำนวนมากจาก IP หลากหลาย ไม่ใช่จาก IP เดิมซ้ำๆ — bandwidth-throttler จะ flag เป็น `viral_suspect` และไม่ throttle ทันที

แทนที่จะ throttle จะรอ grace period 15 นาทีและแจ้ง account management ก่อน ถ้าการใช้งานยังสูงต่อเนื่องหลัง grace period จะ throttle ตามปกติ — logic นี้มีเพื่อไม่ให้ throttle tenant ที่มี viral content โดยไม่ตั้งใจ ซึ่งเป็นกรณีที่ดีสำหรับธุรกิจ ไม่ใช่ abuse

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-content-delivery/bandwidth-throttle-policy]] ("นโยบาย Bandwidth Throttle Threshold") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
