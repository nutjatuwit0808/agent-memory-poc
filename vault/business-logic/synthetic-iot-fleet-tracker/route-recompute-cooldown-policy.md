---
layer: business-logic
tags: [routing, policy]
created: 2025-09-12
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-route-optimizer]]"
---

# นโยบาย Cooldown การคำนวณเส้นทางใหม่

[[structure/synthetic-iot-fleet-tracker/module-route-optimizer]] จะไม่ `recomputeOnDeviation` ซ้ำสำหรับรถคันเดียวกันถี่กว่าทุก 2 นาที แม้จะออกนอกเส้นทางต่อเนื่องก็ตาม เพื่อกันไม่ให้การคำนวณเส้นทางใหม่วนถี่เกินจนคนขับสับสนกับคำแนะนำที่เปลี่ยนตลอดเวลา

ระหว่างช่วง cooldown ระบบยังคงติดตามระยะเบี่ยงเบนสะสมไว้ ถ้าเบี่ยงเบนเกิน 5 กิโลเมตรจากเส้นทางเดิม จะ bypass cooldown แล้วคำนวณใหม่ทันทีเพราะถือว่าเส้นทางเดิมใช้ไม่ได้แล้วจริงๆ
