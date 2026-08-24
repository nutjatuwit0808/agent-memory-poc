---
layer: convention
tags: [telemetry, fleet]
created: 2026-01-18
links:
  - "[[structure/synthetic-warehouse-robotics/module-fleet-controller]]"
---

# Robot Telemetry Convention

หุ่นยนต์ทุกตัวส่ง telemetry เข้า [[structure/synthetic-warehouse-robotics/module-fleet-controller]] ทุก `FLEET_HEARTBEAT_INTERVAL_MS` — เอกสารนี้กำหนดหน่วยและชื่อ field ที่ต้องใช้ตรงกันทุกรุ่นฮาร์ดแวร์

## หน่วยที่ใช้

แบตเตอรี่เป็นเปอร์เซ็นต์จำนวนเต็ม (`batteryPct`), ตำแหน่งเป็นเมตรจาก origin ของแต่ละโซน, แรงกดของแขนหยิบเป็นนิวตัน (N) เสมอ ห้ามส่งหน่วยอื่นปนแม้ฮาร์ดแวร์รุ่นเก่าจะวัดเป็นหน่วยอื่นภายในก็ต้องแปลงก่อนส่ง

## field ที่ห้ามขาด

`robotId`, `timestamp`, `batteryPct`, `zoneId` ต้องมีทุก payload — ขาดตัวใดตัวหนึ่ง fleet-controller จะปฏิเสธ telemetry นั้นทันทีแทนที่จะเดาค่า default
