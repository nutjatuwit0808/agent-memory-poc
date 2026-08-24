---
layer: business-logic
tags: [drm, edge-case]
created: 2025-09-06
links:
  - "[[business-logic/synthetic-video-streaming/drm-license-issuance-policy]]"
---

# ข้อยกเว้น Grace Period เมื่ออุปกรณ์ออฟไลน์ชั่วคราว

ถ้าอุปกรณ์กำลังเล่นวิดีโอที่มี license ที่ยังไม่หมดอายุแต่เครือข่ายหลุดชั่วคราว ผู้เล่นจะเล่นต่อด้วย license เดิมจนกว่าจะหมดอายุจริง ไม่ต้องรอ re-validate ทันทีที่เครือข่ายกลับมา เพื่อไม่ให้การเล่นสะดุดเพราะปัญหาเครือข่ายชั่วคราว

อุปกรณ์ในบ้านเดียวกันไม่เกิน 2 เครื่องที่เล่นพร้อมกันจะไม่ถูกนับเข้า concurrent limit เต็มอัตรา (นับเป็น 1 slot ร่วมกันถ้ายืนยันว่าเป็น account เดียวกันและ IP ใกล้เคียงกัน) เพื่อรองรับการดูพร้อมกันในครัวเรือนโดยไม่ต้องอัปเกรด plan

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-video-streaming/drm-license-issuance-policy]] ("นโยบายการออก DRM License") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
