---
layer: structure
tags: [itinerary, module]
created: 2026-02-25
links:
  - "[[structure/synthetic-travel-booking/module-booking-engine]]"
  - "[[business-logic/synthetic-travel-booking/itinerary-confirmation-timezone-policy]]"
---

# Module: itinerary-builder

ประกอบ booking ที่ยืนยันแล้วหลายตัว (เช่น ที่พัก + เที่ยวบิน) ให้เป็นทริปเดียวที่ผู้เดินทางเห็นภาพรวมได้ในหน้าจอเดียว รวมถึงสร้างอีเมลยืนยันที่มีเวลาเช็คอิน/เช็คเอาต์ครบทุกส่วนของทริป

## ฟังก์ชันหลัก
- `buildItinerary(bookingIds: string[]): Promise<Itinerary>` — รวม booking หลายตัวที่ระบุเป็นทริปเดียว
- `addSegment(itineraryId: string, bookingId: string): Promise<void>` — เพิ่ม booking เข้าทริปที่มีอยู่แล้ว เช่น จองที่พักเพิ่มระหว่างทาง
- `renderConfirmationEmail(itineraryId: string, travelerTz: string): Promise<string>` — สร้างเนื้อหาอีเมลยืนยัน แปลงเวลาทุก segment เป็น timezone ของผู้เดินทาง

## ความสัมพันธ์กับ module อื่น

อ่านข้อมูลจาก [[structure/synthetic-travel-booking/module-booking-engine]] ผ่าน event `booking.confirmed` เท่านั้น ไม่ query ตาราง `bookings` ตรงๆ เพื่อไม่ให้สอง service ผูก schema กันแน่นเกินไป — เวลาที่แสดงในอีเมลต้องแปลงจาก timezone ของสถานที่พักไปเป็น timezone ของผู้เดินทางเสมอ ดู [[business-logic/synthetic-travel-booking/itinerary-confirmation-timezone-policy]]
