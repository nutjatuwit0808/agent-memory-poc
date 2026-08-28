---
layer: structure
tags: [telematics, drivelog, architecture, overview]
created: 2026-04-23
links:
  - "[[structure/synthetic-telematics/module-trip-collector]]"
  - "[[structure/synthetic-telematics/module-driving-scorer]]"
  - "[[structure/synthetic-telematics/module-premium-adjuster]]"
  - "[[structure/synthetic-telematics/module-accident-detector]]"
  - "[[structure/synthetic-telematics/module-device-provisioner]]"
  - "[[structure/synthetic-telematics/module-geofence-monitor]]"
---

# ภาพรวมสถาปัตยกรรม DriveLog — ระบบ Telematics สำหรับประกันภัยรถยนต์

DriveLog คือระบบ telematics สำหรับผลิตภัณฑ์ประกันภัยรถยนต์แบบ usage-based เก็บข้อมูลการขับขี่จากอุปกรณ์ OBD-II ที่ติดตั้งในรถ (ตำแหน่ง GPS, ความเร็ว, ความเร่ง, การเบรกกะทันหัน) แล้วคำนวณคะแนนพฤติกรรมการขับขี่เพื่อปรับเบี้ยประกันให้เหมาะสมกับพฤติกรรมจริงของผู้ขับแต่ละคน แทนอัตราเบี้ยประกันแบบเหมารวม

ทีมวิศวกรรมออกแบบระบบให้แยกความรับผิดชอบระหว่าง 'การเก็บข้อมูลดิบ' กับ 'การตัดสินใจทางธุรกิจ' (คะแนน, เบี้ยประกัน, การแจ้งเตือนอุบัติเหตุ) อย่างชัดเจน เพราะข้อมูลดิบจาก GPS/sensor มีความไม่แน่นอนสูง (สัญญาณหาย, drift) ในขณะที่การตัดสินใจทางธุรกิจต้องมีความแน่นอนและอธิบายได้เพื่อความยุติธรรมต่อผู้ขับ

## Module หลัก

- **trip-collector** — เก็บข้อมูล GPS trace ดิบจากอุปกรณ์ OBD-II ทุกจุดพิกัด รวมกลุ่มเป็น 'เที่ยวการเดิ ดู [[structure/synthetic-telematics/module-trip-collector]]
- **driving-scorer** — คำนวณคะแนนพฤติกรรมการขับขี่จากข้อมูลเที่ยวการเดินทางที่จบแล้ว เป็น service เดียว ดู [[structure/synthetic-telematics/module-driving-scorer]]
- **premium-adjuster** — ปรับเบี้ยประกันตามคะแนนพฤติกรรมการขับขี่ที่คำนวณได้ อ่านผลจาก driving-scorer เท่ ดู [[structure/synthetic-telematics/module-premium-adjuster]]
- **accident-detector** — ตรวจจับสัญญาณที่บ่งชี้ว่าอาจเกิดอุบัติเหตุแบบ real-time จากรูปแบบความเร่ง/การหยุ ดู [[structure/synthetic-telematics/module-accident-detector]]
- **device-provisioner** — จัดการการติดตั้งและเชื่อมโยงอุปกรณ์ OBD-II กับกรมธรรม์ประกันภัย ตรวจสอบสถานะ hea ดู [[structure/synthetic-telematics/module-device-provisioner]]
- **geofence-monitor** — ตรวจสอบว่าตำแหน่งรถอยู่ในเขตพื้นที่ที่กำหนด (geofence) หรือไม่ ใช้สำหรับผลิตภัณฑ ดู [[structure/synthetic-telematics/module-geofence-monitor]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-telematics/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-telematics/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-telematics/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-telematics/database-schema]]
