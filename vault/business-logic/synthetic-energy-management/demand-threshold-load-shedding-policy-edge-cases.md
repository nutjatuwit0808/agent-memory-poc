---
layer: business-logic
tags: [demand-response, edge-case]
created: 2025-10-01
links:
  - "[[business-logic/synthetic-energy-management/demand-threshold-load-shedding-policy]]"
---

# ข้อยกเว้นสำหรับอุปกรณ์ที่กระทบความปลอดภัย

อุปกรณ์ที่เกี่ยวข้องกับความปลอดภัย (ระบบระบายอากาศห้องเครื่อง, ระบบทำความเย็น server room) ไม่อยู่ในรายการที่ load shedding เลือกปิดได้อัตโนมัติไม่ว่า demand จะสูงแค่ไหนก็ตาม ต้องได้รับการอนุมัติจากทีมอาคารด้วยมือเท่านั้น

ถ้า demand ยังคงเกิน threshold แม้ปิดอุปกรณ์ที่ไม่ใช่ safety-critical ครบทุกตัวแล้ว ระบบจะแจ้งเตือนทีมอาคารระดับสูงสุดแทนการพยายามปิดอุปกรณ์ safety-critical เอง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-energy-management/demand-threshold-load-shedding-policy]] ("นโยบายการลดโหลดเมื่อ Demand เกิน Threshold") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
