---
layer: business-logic
tags: [live, scaling, policy]
created: 2026-03-07
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
---

# นโยบายการ Scale ล่วงหน้าสำหรับ Live Event

live event ที่ publisher จองล่วงหน้าผ่านระบบตารางเวลา จะทำให้ [[structure/synthetic-video-streaming/module-transcode-worker]] scale worker pool ล่วงหน้า 15 นาทีก่อนเวลาเริ่มจริงเสมอ ไม่รอให้ segment แรกเข้ามาก่อนแล้วค่อย scale แบบ reactive

จำนวน worker ที่ scale ล่วงหน้าคำนวณจากจำนวนผู้ชมที่คาดการณ์ไว้ ไม่ใช่ค่าคงที่ตายตัว — event ที่คาดว่าผู้ชมเยอะจะได้ worker สำรองมากกว่า
