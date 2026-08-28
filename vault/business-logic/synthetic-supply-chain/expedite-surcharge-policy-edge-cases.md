---
layer: business-logic
tags: [expedite, surcharge, edge-case]
created: 2026-08-17
links:
  - "[[business-logic/synthetic-supply-chain/expedite-surcharge-policy]]"
---

# ข้อยกเว้น Expedite Surcharge: กรณีซัพพลายเออร์ผิด SLA

ถ้าความจำเป็นต้องใช้ expedite เกิดจากซัพพลายเออร์ส่งสินค้าชุดก่อนหน้าล่าช้าจน stock หมด ซัพพลายเออร์รายนั้นไม่มีสิทธิ์เรียก surcharge สำหรับ expedite ที่ตามมา เพราะเป็นผลโดยตรงจากความผิดของตัวเอง ทีม procurement ต้องบันทึก causal link นี้ไว้ใน PO comment ก่อนส่งให้ซัพพลายเออร์

ซัพพลายเออร์ที่พยายาม claim surcharge ในกรณีที่ตนเองผิด SLA จะถูกบันทึกเป็น dispute event ใน performance record แยกจาก quality event การสะสม dispute มากกว่า 2 ครั้งในปีเดียวกันจะกระทบ performance score แม้ตัว dispute จะยังไม่มีข้อยุติ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-supply-chain/expedite-surcharge-policy]] ("นโยบาย Expedite Surcharge สำหรับการจัดส่งเร่งด่วน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
