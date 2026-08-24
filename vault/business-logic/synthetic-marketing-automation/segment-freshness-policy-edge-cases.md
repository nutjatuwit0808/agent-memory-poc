---
layer: business-logic
tags: [segment, edge-case]
created: 2026-07-10
links:
  - "[[business-logic/synthetic-marketing-automation/segment-freshness-policy]]"
---

# ข้อยกเว้นสำหรับ Segment ขนาดใหญ่ที่คำนวณนาน

segment ที่มีสมาชิกเกิน 2 ล้าน contact ใช้เวลา `recomputeSegment` นานเกิน 24 ชั่วโมงในบางกรณี — สำหรับ segment กลุ่มนี้ freshness threshold ขยับเป็น 48 ชั่วโมงแทน ไม่ใช่บังคับ 24 ชั่วโมงเท่ากันหมดโดยไม่สนขนาด

ถ้า campaign ถูก schedule ไว้ล่วงหน้านานกว่า freshness threshold ของ segment ที่ใช้ ระบบจะ auto-trigger `recomputeSegment` ล่วงหน้าก่อนเวลาส่งจริงเสมอ แทนที่จะรอให้ `validateCampaign` ตรวจพบว่า stale ตอนใกล้เวลาส่ง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-marketing-automation/segment-freshness-policy]] ("นโยบายความสดของ Segment Snapshot") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
