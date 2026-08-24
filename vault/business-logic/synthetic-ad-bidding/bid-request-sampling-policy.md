---
layer: business-logic
tags: [logging, sampling, policy]
created: 2026-07-26
---

# นโยบายการ Sample Log ของ Bid Request

log เต็มของทุก bid request มีปริมาณสูงเกินกว่าจะเก็บทั้งหมดได้คุ้มค่า ระบบจึง sample เก็บ log แบบเต็มไว้เพียง 1% ของ request ทั้งหมด (สุ่มแบบ deterministic ตาม request ID เพื่อให้ trace เดิมซ้ำได้เสมอถ้าต้อง debug)

request ที่ถูก fraud-filter block หรือ auction-engine ปฏิเสธเพราะ budget หมด จะถูกเก็บ log เต็มเสมอไม่ว่าจะ sample โดนหรือไม่ เพราะเป็นกรณีที่ทีม analysis ต้องการข้อมูลมากกว่ากรณีปกติ
