---
layer: structure
tags: [fraud-detection, shieldai, architecture, overview]
created: 2026-06-26
links:
  - "[[structure/synthetic-fraud-detection/module-signal-collector]]"
  - "[[structure/synthetic-fraud-detection/module-rule-engine]]"
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
  - "[[structure/synthetic-fraud-detection/module-case-manager]]"
  - "[[structure/synthetic-fraud-detection/module-device-fingerprinter]]"
  - "[[structure/synthetic-fraud-detection/module-velocity-tracker]]"
---

# ภาพรวมสถาปัตยกรรม ShieldAI — ระบบตรวจจับการทุจริต

ShieldAI คือระบบตรวจจับการทุจริต (fraud detection) แบบ real-time สำหรับ digital transaction ที่หลากหลาย ตั้งแต่การสมัครบัญชีปลอม การใช้งานโปรโมชั่นผิดวัตถุประสงค์ การรีวิวปลอม ไปจนถึงบอตและการโจมตีแบบ automated ระบบวิเคราะห์ behavioral signal, device fingerprint, และ velocity pattern พร้อมกันเพื่อให้คะแนนความเสี่ยงต่อทุก event ใน millisecond

ระบบแบ่งเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่การเก็บ signal จากหลายช่องทาง การประเมินด้วย rule-based engine การให้คะแนนด้วย ML model ไปจนถึงการบริหารจัดการ case ที่ต้องให้นักวิเคราะห์ตรวจสอบ ทีมวิศวกรรมเรียก event ที่มีคะแนนเสี่ยงสูงกว่า 80 ว่า high-risk signal เพราะต้องการ action ภายใน SLA ที่กำหนด

## Module หลัก

- **signal-collector** — รับ raw event จาก API gateway แล้วแปลงเป็น structured signal ก่อนส่งต่อเข้า anal ดู [[structure/synthetic-fraud-detection/module-signal-collector]]
- **rule-engine** — ประเมิน signal ด้วยชุด rule แบบ deterministic ให้ partial score และ rule_flags ท ดู [[structure/synthetic-fraud-detection/module-rule-engine]]
- **ml-scorer** — ให้คะแนนความเสี่ยงของ signal ด้วย ML model ที่ train บน behavioral pattern ประวั ดู [[structure/synthetic-fraud-detection/module-ml-scorer]]
- **case-manager** — รวม output จาก [[structure/synthetic-fraud-detection/module-rule-engine]] และ [[structure/synthetic-fraud-detection/module-ml-scorer]] แล้วตัดสิ ดู [[structure/synthetic-fraud-detection/module-case-manager]]
- **device-fingerprinter** — สร้างและจัดการ device fingerprint จากข้อมูล browser/app ที่รวบรวมจาก client เช่น ดู [[structure/synthetic-fraud-detection/module-device-fingerprinter]]
- **velocity-tracker** — นับความถี่ (velocity) ของ event ตาม dimension ต่างๆ ดู [[structure/synthetic-fraud-detection/module-velocity-tracker]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-fraud-detection/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-fraud-detection/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-fraud-detection/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-fraud-detection/database-schema]]
