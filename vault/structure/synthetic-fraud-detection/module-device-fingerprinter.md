---
layer: structure
tags: [device, fingerprint, module]
created: 2026-03-26
links:
  - "[[business-logic/synthetic-fraud-detection/device-trust-decay-policy]]"
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
---

# Module: device-fingerprinter

สร้างและจัดการ device fingerprint จากข้อมูล browser/app ที่รวบรวมจาก client เช่น screen resolution, timezone, installed fonts, canvas rendering, และ WebGL signature รวมกันเป็น fingerprint เดียวเพื่อระบุ device ได้แม้ไม่มี cookie หรือ device ID ชัดเจน

## ฟังก์ชันหลัก
- `computeFingerprint(deviceAttributes: DeviceAttributes): Promise<string>` — คำนวณ fingerprint hash จาก device attribute ที่รับมา
- `getTrustScore(fingerprint: string): Promise<number>` — คืน trust score 0-100 ของ device นี้จากประวัติการใช้งานในอดีต
- `decayTrustScore(fingerprint: string, reason: string): Promise<void>` — ลด trust score เมื่อพบ suspicious behavior ดู [[business-logic/synthetic-fraud-detection/device-trust-decay-policy]]

## ความสัมพันธ์กับ module อื่น

[[structure/synthetic-fraud-detection/module-ml-scorer]] เรียก `getTrustScore` ระหว่าง feature extraction เพื่อนำ device trust เป็น feature หนึ่งใน model fingerprint ที่มีประวัติทุจริตซ้ำจะมีคะแนนต่ำลง ทำให้ score จาก ml-scorer สูงขึ้นโดยอัตโนมัติ
