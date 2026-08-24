---
layer: structure
tags: [scheduling, module]
created: 2026-03-21
links:
  - "[[business-logic/synthetic-recruitment-ats/interview-scheduling-conflict-policy]]"
---

# Module: interview-scheduler

จัดตารางนัดสัมภาษณ์ระหว่างผู้สมัครกับ interviewer โดย sync กับปฏิทินภายนอก (Google Calendar/Outlook) ของ interviewer แต่ละคน แยกออกมาเป็น service อิสระเพราะ logic การหาช่วงเวลาว่างที่ตรงกันของหลายฝ่ายพร้อมกันซับซ้อนและมี edge case ด้าน timezone เยอะ

## ฟังก์ชันหลัก
- `findAvailableSlots(interviewerIds: string[], durationMin: number, window: TimeWindow): Promise<Slot[]>` — หาช่วงเวลาว่างที่ interviewer ทุกคนว่างตรงกัน
- `bookInterview(candidateId: string, interviewerIds: string[], slot: Slot): Promise<string>` — ยืนยันการนัดสัมภาษณ์ คืน interviewId
- `rescheduleInterview(interviewId: string, newSlot: Slot): Promise<void>` — เลื่อนนัดสัมภาษณ์ไปช่วงเวลาใหม่
- `cancelInterview(interviewId: string, reason: string): Promise<void>` — ยกเลิกนัดสัมภาษณ์

## ความสัมพันธ์กับ module อื่น

sync กับปฏิทินภายนอกแบบ two-way — ถ้า interviewer ยกเลิกจากปฏิทินของตัวเองโดยตรง (ไม่ผ่าน TalentFlow) ระบบต้องตรวจจับและอัปเดตสถานะให้ตรงกันภายในรอบ sync ถัดไป ดู [[business-logic/synthetic-recruitment-ats/interview-scheduling-conflict-policy]] สำหรับกติกาการชนกันของการจอง
