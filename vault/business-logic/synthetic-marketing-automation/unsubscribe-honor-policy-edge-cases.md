---
layer: business-logic
tags: [consent, compliance, edge-case]
created: 2025-12-27
links:
  - "[[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy]]"
---

# ข้อยกเว้นเมื่อ Unsubscribe ผ่าน Suppression List นำเข้าจากภายนอก

รายชื่อ suppression list ที่นำเข้าจากหน่วยงานภายนอก (เช่น national do-not-email registry) ไม่ผ่าน SLA 24 ชั่วโมงปกติ — ต้อง apply ก่อนส่ง batch ถัดไปทันทีเสมอโดยไม่มีข้อยกเว้น เพราะความเสี่ยงทางกฎหมายสูงกว่าคำขอ unsubscribe ทั่วไป

ถ้า contact คนเดียวมีสถานะขัดแย้งกันระหว่าง consent ที่บันทึกในระบบกับ suppression list ภายนอก suppression list ชนะเสมอไม่ว่า timestamp ไหนใหม่กว่า เพราะถือเป็นแหล่งข้อมูลที่มีผลทางกฎหมายสูงสุด

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-marketing-automation/unsubscribe-honor-policy]] ("นโยบาย SLA การ Honor คำขอ Unsubscribe") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
