---
layer: structure
tags: [trending, module]
created: 2025-10-07
links:
  - "[[structure/synthetic-social-feed/service-boundaries]]"
  - "[[structure/synthetic-social-feed/module-engagement-tracker]]"
  - "[[business-logic/synthetic-social-feed/trending-topic-decay-policy]]"
---

# Module: trending-topic-detector

ตรวจจับ hashtag/หัวข้อที่กำลังถูกพูดถึงเยอะผิดปกติในช่วงเวลาสั้นๆ เทียบกับ baseline ปกติของหัวข้อนั้น เพื่อดันขึ้นแสดงในส่วน trending ของแอป ทำงานเป็น background job ไม่ได้อยู่บน critical path ของการโหลด feed

## ฟังก์ชันหลัก
- `computeTrendingScore(topicId: string, windowMinutes: number): Promise<number>` — คำนวณคะแนนความ trending เทียบกับ baseline
- `refreshTrendingList(): Promise<TrendingTopic[]>` — รีเฟรชรายการ trending ทั้งหมด รันทุก 10 นาที
- `suppressTopic(topicId: string, reason: string): Promise<void>` — ระงับหัวข้อที่ trending ผิดปกติ (สงสัยว่าถูกปั่น)

## ความสัมพันธ์กับ module อื่น

ไม่รู้จักสถานะ moderation ของโพสต์แต่ละอัน (ดู [[structure/synthetic-social-feed/service-boundaries]]) — ใช้แค่จำนวนการพูดถึงดิบจาก [[structure/synthetic-social-feed/module-engagement-tracker]] เป็นหลัก ดู [[business-logic/synthetic-social-feed/trending-topic-decay-policy]] สำหรับการลดคะแนนตามเวลา
