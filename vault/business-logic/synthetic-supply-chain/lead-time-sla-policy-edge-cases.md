---
layer: business-logic
tags: [lead-time, sla, edge-case]
created: 2026-06-07
links:
  - "[[business-logic/synthetic-supply-chain/dual-source-requirement-policy]]"
  - "[[business-logic/synthetic-supply-chain/lead-time-sla-policy]]"
---

# ข้อยกเว้น SLA Lead Time กรณี Force Majeure

กรณีเหตุการณ์ force majeure ที่มีเอกสารยืนยัน เช่น ภัยธรรมชาติ การหยุดงานประท้วง หรือการปิดท่าเรือโดยหน่วยงานรัฐ ซัพพลายเออร์สามารถยื่นขอยกเว้น SLA penalty ได้ภายใน 5 วันทำการนับจากเหตุการณ์ ทีม procurement ต้องตรวจสอบและอนุมัติ/ปฏิเสธภายใน 10 วันทำการ

แม้จะได้รับยกเว้น penalty แต่เหตุการณ์ยังถูกบันทึกใน performance history เพราะใช้ในการประเมิน risk concentration (ซัพพลายเออร์ที่อยู่ในพื้นที่ risk สูงควรอยู่ใน [[business-logic/synthetic-supply-chain/dual-source-requirement-policy]]) ไม่ใช่แค่ลบ event ออกโดยสิ้นเชิง

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-supply-chain/lead-time-sla-policy]] ("นโยบาย SLA Lead Time การจัดส่งของซัพพลายเออร์") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
