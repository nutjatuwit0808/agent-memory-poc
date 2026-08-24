---
layer: structure
tags: [iot-fleet-tracker, trackgrid, architecture, overview]
created: 2026-07-03
links:
  - "[[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-route-optimizer]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-device-provisioning]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]]"
  - "[[structure/synthetic-iot-fleet-tracker/module-trip-aggregator]]"
---

# ภาพรวมสถาปัตยกรรม TrackGrid — ระบบติดตามฟลีทยานพาหนะ

TrackGrid คือแพลตฟอร์มติดตามตำแหน่งยานพาหนะแบบเรียลไทม์สำหรับบริษัทโลจิสติกส์ รับสัญญาณจากอุปกรณ์ GPS tracker ที่ติดตั้งบนรถบรรทุกและรถส่งของหลายหมื่นคันทั่วประเทศ ตัวอุปกรณ์เองเป็นฮาร์ดแวร์บางที่ทำหน้าที่แค่ส่งพิกัดกับ telemetry พื้นฐาน (ความเร็ว, ทิศทาง, ระดับน้ำมัน/แบตเตอรี่) ส่วนตรรกะทั้งหมด เช่น การตัดสินว่ารถเข้า-ออกโซนไหน หรือควรวิ่งเส้นทางไหน อยู่ฝั่ง backend ทั้งหมด

ระบบแบ่งเป็น service ย่อยตามหน้าที่ ตั้งแต่รับ ping ดิบจากอุปกรณ์ ไปจนถึงคำนวณเส้นทางที่ดีที่สุดและสรุปทริปเพื่อออกบิลลูกค้า ทีมวิศวกรรมเรียกช่วง 07:00-09:00 และ 16:00-19:00 ว่า rush window เพราะเป็นช่วงที่ปริมาณ ping เข้าระบบพุ่งสูงสุดจากรถส่งของที่วิ่งพร้อมกันเยอะที่สุด

## Module หลัก

- **gps-ingest** — รับ ping ดิบจากอุปกรณ์ GPS tracker ทุกตัวผ่าน UDP listener แบบ lightweight แล้วแ ดู [[structure/synthetic-iot-fleet-tracker/module-gps-ingest]]
- **geofence-engine** — ประเมินว่าตำแหน่งล่าสุดของยานพาหนะแต่ละคันอยู่ในโซนที่ลูกค้ากำหนดไว้หรือไม่ (เช่น เขตส่งของ, เขตห้ามเข้า) แล้ว publish event เข้า-ออกโซน แยกออกมาจาก gps-ingest ตั้งแต่กลางปี 2025 เพราะ logic การเทียบ polygon ซับซ้อนขึ้นเรื่อยๆ ดู [[structure/synthetic-iot-fleet-tracker/module-geofence-engine]]
- **route-optimizer** — คำนวณเส้นทางที่ดีที่สุดสำหรับรถแต่ละคันตามจุดส่งของที่ต้องแวะ โดยพิจารณาสภาพการจ ดู [[structure/synthetic-iot-fleet-tracker/module-route-optimizer]]
- **device-provisioning** — จัดการวงจรชีวิตของอุปกรณ์ GPS tracker ตั้งแต่ลงทะเบียนอุปกรณ์ใหม่ ผูกกับยานพาหนะ ดู [[structure/synthetic-iot-fleet-tracker/module-device-provisioning]]
- **alert-dispatcher** — ตัดสินใจว่า event ไหน (geofence, offline, ความเร็วเกิน) ควรแจ้งเตือนลูกค้าทันทีผ ดู [[structure/synthetic-iot-fleet-tracker/module-alert-dispatcher]]
- **trip-aggregator** — รวบรวม ping ดิบและ geofence event ของยานพาหนะแต่ละคันมาประกอบเป็น "ทริป" (จุดเริ ดู [[structure/synthetic-iot-fleet-tracker/module-trip-aggregator]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-iot-fleet-tracker/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-iot-fleet-tracker/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-iot-fleet-tracker/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-iot-fleet-tracker/database-schema]]
