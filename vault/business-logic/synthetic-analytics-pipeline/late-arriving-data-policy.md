---
layer: business-logic
tags: [transform, late-data, policy]
created: 2026-02-19
links:
  - "[[structure/synthetic-analytics-pipeline/module-transform-engine]]"
  - "[[business-logic/synthetic-analytics-pipeline/late-arriving-data-policy-edge-cases]]"
---

# นโยบายจัดการข้อมูลที่มาถึงช้า

ข้อมูลบางส่วนจากต้นทางอาจมาถึงหลังจาก batch window ของวันนั้นปิดไปแล้ว (เช่น transaction ที่บันทึกล่าช้าจากระบบต้นทาง) [[structure/synthetic-analytics-pipeline/module-transform-engine]] จะยอมรับข้อมูลที่มาช้าได้ไม่เกิน 48 ชั่วโมงหลังวันที่ข้อมูลควรจะมาถึง

ข้อมูลที่มาช้าจะถูกแปลงและโหลดเข้า partition ของวันที่ข้อมูลนั้นควรอยู่จริง (ไม่ใช่วันที่ประมวลผลจริง) เพื่อให้ metric ย้อนหลังถูกต้องตามช่วงเวลาที่เหตุการณ์เกิดขึ้นจริง ไม่ใช่ตามเวลาที่ระบบเห็นข้อมูล

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-analytics-pipeline/late-arriving-data-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
