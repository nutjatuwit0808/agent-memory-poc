---
layer: structure
tags: [scoring, module, core]
created: 2026-06-18
links:
  - "[[structure/synthetic-telematics/module-premium-adjuster]]"
  - "[[business-logic/synthetic-telematics/score-recalculation-frequency-policy]]"
---

# Module: driving-scorer

คำนวณคะแนนพฤติกรรมการขับขี่จากข้อมูลเที่ยวการเดินทางที่จบแล้ว เป็น service เดียวที่ตัดสินใจคะแนนทั้งหมด ไม่มี service อื่นคำนวณคะแนนซ้ำเอง เพื่อให้คะแนนที่ใช้ปรับเบี้ยประกันมีที่มาเดียวที่ตรวจสอบย้อนหลังได้เสมอ

## ฟังก์ชันหลัก
- `calculateTripScore(tripId: string): Promise<TripScore>` — คำนวณคะแนนของเที่ยวการเดินทางหนึ่ง
- `recalculateOverallScore(policyholderId: string): Promise<OverallScore>` — คำนวณคะแนนรวมของผู้ขับใหม่จากทุกเที่ยวในช่วงเวลาที่กำหนด
- `getScoreHistory(policyholderId: string, range: TimeRange): Promise<TripScore[]>` — คืนประวัติคะแนนย้อนหลัง

## State

pending → calculated — คะแนนที่คำนวณแล้วไม่ถูกลบทิ้ง แม้จะมีการคำนวณคะแนนรวมใหม่ในภายหลัง

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-telematics/module-premium-adjuster]] อ่านผลจาก service นี้เท่านั้น ไม่คำนวณคะแนนเอง ดู [[business-logic/synthetic-telematics/score-recalculation-frequency-policy]]
