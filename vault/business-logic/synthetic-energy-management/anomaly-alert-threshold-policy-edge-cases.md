---
layer: business-logic
tags: [anomaly, edge-case]
created: 2026-02-13
links:
  - "[[business-logic/synthetic-energy-management/anomaly-alert-threshold-policy]]"
---

# ข้อยกเว้นช่วงเปลี่ยนฤดูกาลหรือปรับปรุงอาคาร

ช่วงที่อาคารมีการปรับปรุงหรือเปลี่ยนแปลงการใช้งานอย่างมีนัยสำคัญ (เช่น ติดตั้งอุปกรณ์ใหม่ถาวร) ทีมอาคารสามารถ mark ช่วงเวลานั้นเป็น 'baseline reset' เพื่อไม่ให้ข้อมูลก่อนการเปลี่ยนแปลงมาปนกับการคำนวณ baseline ใหม่

การเปลี่ยนฤดูกาลปกติ (ฤดูร้อน/ฤดูฝน) ไม่ถือเป็นเหตุผลให้ mark baseline reset เพราะ baseline ควรปรับตัวตามฤดูกาลได้เองจากหน้าต่างข้อมูล 30 วันอยู่แล้ว การ mark reset บ่อยเกินไปจะทำให้ baseline ไม่นิ่งพอที่จะตรวจจับความผิดปกติจริงได้

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-energy-management/anomaly-alert-threshold-policy]] ("นโยบายเกณฑ์การแจ้งเตือนความผิดปกติ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
