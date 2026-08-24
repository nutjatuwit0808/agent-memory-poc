---
layer: business-logic
tags: [retention, policy]
created: 2026-02-27
---

# นโยบายการเก็บประวัติผลการพยากรณ์

ผล `forecast_runs` และ `forecast_results` เก็บไว้ 18 เดือนสำหรับใช้คำนวณ accuracy ย้อนหลังและ debug — เกินกว่านั้น archive ไปเก็บแบบ cold storage แทนที่จะลบทิ้ง เพราะทีมวิเคราะห์บางครั้งต้องเทียบ pattern ปีต่อปี

`accuracy_metrics` เก็บถาวรไม่มีวันลบ เพราะเป็นข้อมูลขนาดเล็กมากเทียบกับ `forecast_results` และมีประโยชน์ระยะยาวสำหรับติดตามคุณภาพโมเดลข้ามปี
