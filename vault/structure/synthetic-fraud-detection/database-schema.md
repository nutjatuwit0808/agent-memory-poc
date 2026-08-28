---
layer: structure
tags: [fraud-detection, shieldai, database, schema]
created: 2026-04-23
links:
  - "[[structure/synthetic-fraud-detection/module-case-manager]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-fraud-detection/module-case-manager]] ดูแล ได้แก่ `fraud_cases` (ทุก case ที่สร้างขึ้น ไม่ลบทิ้ง), `case_reviews` (ประวัติการ review ของ analyst), และ `case_decisions` (ผลการตัดสินใจสุดท้ายพร้อม reason)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `signals` | signal-collector | raw signal ทุก event, retention 90 วัน |
| `rule_versions` | rule-engine | ทุก version ของ rule, ไม่ลบทิ้ง |
| `score_log` | ml-scorer | คะแนนทุก prediction พร้อม feature snapshot |
| `device_profiles` | device-fingerprinter | fingerprint และ trust score ของแต่ละ device |

ทุกตารางมี `event_id` เป็น key ร่วมแบบ soft reference เพื่อ correlate signal, score, และ case ด้วยกันได้ ตรวจสอบด้วย daily reconciliation job
