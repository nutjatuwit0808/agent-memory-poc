---
layer: business-logic
tags: [freshness, export, edge-case]
created: 2026-01-16
links:
  - "[[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]]"
---

# ข้อยกเว้น: Segment ที่ Refresh ล้มเหลวแต่ยังต้องการ Export

ถ้า refresh ล้มเหลวและทีม marketing ยืนยันว่าต้องการ export segment นั้นทันทีแม้ข้อมูลจะเก่า สามารถ trigger export โดยใช้ `force_stale=true` ผ่าน admin API ได้ — แต่ต้องมี manager approve ใน ticketing system ก่อน และ export log จะถูก flag ว่าใช้ stale data

export ที่ใช้ stale data จะถูกรายงานแยกใน export history และ health monitor จะ deduct คะแนนจาก health score ของ segment นั้นด้วย เพื่อให้ทีมตระหนักถึงความถี่ที่เกิดเหตุการณ์แบบนี้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-customer-segmentation/segment-freshness-sla-policy]] ("นโยบาย Segment Freshness SLA") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
