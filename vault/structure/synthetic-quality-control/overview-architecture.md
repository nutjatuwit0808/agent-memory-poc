---
layer: structure
tags: [quality-control, qualitypulse, architecture, overview]
created: 2026-06-15
links:
  - "[[structure/synthetic-quality-control/module-measurement-collector]]"
  - "[[structure/synthetic-quality-control/module-spc-analyzer]]"
  - "[[structure/synthetic-quality-control/module-batch-inspector]]"
  - "[[structure/synthetic-quality-control/module-rework-coordinator]]"
  - "[[structure/synthetic-quality-control/module-quarantine-manager]]"
  - "[[structure/synthetic-quality-control/module-certification-generator]]"
---

# ภาพรวมสถาปัตยกรรม QualityPulse — ระบบควบคุณภาพการผลิต

QualityPulse คือแพลตฟอร์มควบคุมคุณภาพในกระบวนการผลิต รับข้อมูลวัดจากเซ็นเซอร์บนสายการผลิต ประมวลผลด้วย Statistical Process Control (SPC) chart เพื่อตรวจจับ batch ที่ออกนอกสเปก แล้ว trigger กระบวนการ rework หรือ quarantine ตามกฎที่กำหนดไว้ ก่อนออกใบรับรองสินค้าสำหรับการขนส่ง

ระบบแบ่งออกเป็น service ย่อยตามขั้นตอนคุณภาพ ตั้งแต่เก็บข้อมูลวัด วิเคราะห์ด้วย SPC ตรวจ batch ประสาน rework กักกัน batch มีปัญหา ไปจนถึงออกเอกสารรับรองสำหรับ shipment ทีมควบคุมคุณภาพเรียกช่วงที่ production ผ่านสายหลักว่า active run และเป็นช่วงที่ข้อมูลเซ็นเซอร์ไหลเข้าระบบหนาแน่นที่สุด

## Module หลัก

- **measurement-collector** — รับผิดชอบรับข้อมูลวัดจากเซ็นเซอร์บนสายการผลิตและบันทึกลง database โดยตรวจสอบ ins ดู [[structure/synthetic-quality-control/module-measurement-collector]]
- **spc-analyzer** — ดึงข้อมูลวัดจาก [[structure/synthetic-quality-control/module-measurement-collector]] มาคำนวณ control chart แบบ W ดู [[structure/synthetic-quality-control/module-spc-analyzer]]
- **batch-inspector** — รับ event จาก [[structure/synthetic-quality-control/module-spc-analyzer]] แล้วตัดสินใจว่า batch แต่ละ batch จะผ่ ดู [[structure/synthetic-quality-control/module-batch-inspector]]
- **rework-coordinator** — ประสานกระบวนการ rework ของ batch ที่ถูก reject จัดสรรทรัพยากรในสายรื้องาน บันทึก ดู [[structure/synthetic-quality-control/module-rework-coordinator]]
- **quarantine-manager** — จัดการ hold batch ที่ถูก quarantine ติดตาม duration ของแต่ละ hold ส่ง alert เมื่ ดู [[structure/synthetic-quality-control/module-quarantine-manager]]
- **certification-generator** — ออกใบรับรองคุณภาพสำหรับ batch ที่ผ่านการตรวจแล้วเพื่อแนบไปกับ shipment ตรวจสอบก่ ดู [[structure/synthetic-quality-control/module-certification-generator]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-quality-control/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-quality-control/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-quality-control/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-quality-control/database-schema]]
