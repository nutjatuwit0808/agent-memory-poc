---
layer: business-logic
tags: [health, empty-segment, edge-case]
created: 2026-03-25
links:
  - "[[business-logic/synthetic-customer-segmentation/minimum-segment-size-policy]]"
  - "[[business-logic/synthetic-customer-segmentation/health-score-threshold-policy]]"
---

# ข้อยกเว้น: Health Score คำนวณบน Segment ที่ Membership เป็น 0

segment ที่ refresh ผ่านแต่ได้ membership 0 คน (ไม่มีใครตรงเงื่อนไขเลย) จะได้ health score 0 ทันทีและถูก mark เป็น `critical` แม้ว่าเหตุผลที่ membership เป็น 0 อาจเป็นเพราะ definition ที่ intentionally strict ไม่ใช่ error

เพื่อป้องกัน false critical alert กรณีนี้ owner segment สามารถ set `allow_empty=true` ใน definition ได้ ซึ่งจะ exclude membership size จากการคำนวณ score และ health monitor จะใช้ 3 metric ที่เหลือแทน — แต่ segment ที่ `allow_empty=true` ยังคงถูก block จาก export ตาม [[business-logic/synthetic-customer-segmentation/minimum-segment-size-policy]]

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-customer-segmentation/health-score-threshold-policy]] ("นโยบาย Health Score Threshold และการ Escalate") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
