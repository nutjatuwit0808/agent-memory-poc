---
layer: convention
tags: [gps, precision]
created: 2026-03-29
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-trip-aggregator]]"
---

# Coordinate Precision Convention

เอกสารนี้กำหนดว่าพิกัดและหน่วยที่เกี่ยวกับตำแหน่งต้องเก็บและส่งต่อกันอย่างไรให้สอดคล้องกันทุก service

## ความละเอียดพิกัด

เก็บ `lat`/`lng` เป็นทศนิยม 6 ตำแหน่งเสมอ (ความละเอียดประมาณ 11 เซนติเมตร) ห้ามปัดเศษเพิ่มระหว่างทางแม้จะดูไม่จำเป็นสำหรับการแสดงผล เพราะ [[structure/synthetic-iot-fleet-tracker/module-trip-aggregator]] ต้องการความละเอียดเต็มสำหรับคำนวณระยะทางสะสม

## หน่วยที่ใช้

ความเร็วเป็น กม./ชม. เสมอ (ไม่ใช่ m/s หรือ mph) ระยะทางเป็นกิโลเมตร ทิศทาง (`headingDeg`) เป็นองศา 0-360 วัดจากทิศเหนือตามเข็มนาฬิกา
