---
layer: structure
tags: [scheduling, module]
created: 2025-09-04
links:
  - "[[structure/synthetic-health-records/module-patient-record-store]]"
  - "[[structure/synthetic-health-records/module-provider-access-control]]"
---

# Module: appointment-scheduler

จัดการการนัดหมายระหว่างผู้ป่วยกับแพทย์ ตรวจสอบความว่างของตารางเวลาแพทย์แต่ละคนและป้องกันการจองซ้ำ ทำงานแยกจาก patient-record-store โดยสิ้นเชิงเพราะการนัดหมายไม่จำเป็นต้องรู้รายละเอียดทางการแพทย์ของผู้ป่วยเลย

## ฟังก์ชันหลัก
- `bookAppointment(patientId: string, providerId: string, slot: TimeSlot): Promise<string>` — จองนัดหมาย คืน appointmentId ถ้าสำเร็จ
- `cancelAppointment(appointmentId: string, reason: string): Promise<void>` — ยกเลิกนัดหมาย ปล่อย slot กลับคืน
- `getProviderAvailability(providerId: string, dateRange: DateRange): Promise<TimeSlot[]>` — คืนช่วงเวลาว่างของแพทย์

## ความสัมพันธ์กับ module อื่น

ไม่คุยกับ [[structure/synthetic-health-records/module-patient-record-store]] โดยตรง — เก็บแค่ patientId เป็น reference เท่านั้น ถ้าแพทย์ต้องการดูประวัติผู้ป่วยก่อนนัด ต้องเรียกผ่าน [[structure/synthetic-health-records/module-provider-access-control]] แยกต่างหาก
