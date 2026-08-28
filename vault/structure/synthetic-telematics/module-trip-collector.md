---
layer: structure
tags: [trip, module, core]
created: 2026-04-02
links:
  - "[[business-logic/synthetic-telematics/harsh-event-sensitivity-threshold-policy]]"
  - "[[structure/synthetic-telematics/module-driving-scorer]]"
---

# Module: trip-collector

เก็บข้อมูล GPS trace ดิบจากอุปกรณ์ OBD-II ทุกจุดพิกัด รวมกลุ่มเป็น 'เที่ยวการเดินทาง' (trip) ตามช่วงเวลาที่รถวิ่งต่อเนื่อง เป็น service เดียวที่ตัดสินใจว่าจุดข้อมูลไหนอยู่ในเที่ยวไหน แยกออกมาเป็น service อิสระเพราะ throughput ของข้อมูล GPS สูงกว่า service อื่นในระบบมาก

## ฟังก์ชันหลัก
- `ingestGpsPoint(deviceId: string, point: GpsPoint): Promise<void>` — รับจุดพิกัด GPS 1 จุด บันทึกเข้า trip ปัจจุบันหรือเริ่ม trip ใหม่
- `finalizeTrip(deviceId: string): Promise<string>` — ปิดเที่ยวการเดินทางปัจจุบันเมื่อรถหยุดนิ่งนานเกินเกณฑ์ คืน tripId
- `getTripDetail(tripId: string): Promise<TripDetail>` — ดึงรายละเอียดเที่ยวการเดินทางหนึ่งรวม harsh event ที่เกิดขึ้น

## State

in_progress → finalized — ดู [[business-logic/synthetic-telematics/harsh-event-sensitivity-threshold-policy]] สำหรับเกณฑ์การตรวจจับเหตุการณ์ระหว่างเที่ยว

## ความสัมพันธ์กับ module อื่น

ทุกครั้งที่ `finalizeTrip` สำเร็จ publish event `trip.completed` ให้ [[structure/synthetic-telematics/module-driving-scorer]] subscribe เพื่อคำนวณคะแนนใหม่ทันที
