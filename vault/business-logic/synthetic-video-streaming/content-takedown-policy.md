---
layer: business-logic
tags: [takedown, compliance, policy]
created: 2025-09-02
links:
  - "[[structure/synthetic-video-streaming/module-cdn-origin-shield]]"
  - "[[structure/synthetic-video-streaming/module-drm-license-server]]"
---

# นโยบายการถอดคอนเทนต์ (Takedown)

เมื่อได้รับคำขอถอดคอนเทนต์ที่ผ่านการยืนยันสิทธิ์แล้ว (เช่นคำร้อง DMCA) ระบบต้อง purge cache ที่ [[structure/synthetic-video-streaming/module-cdn-origin-shield]] และเพิกถอน license ที่ยังไม่หมดอายุที่ [[structure/synthetic-video-streaming/module-drm-license-server]] พร้อมกันภายใน 1 ชั่วโมง

ไฟล์ต้นฉบับและ rendition จะไม่ถูกลบทิ้งทันที แต่ถูกย้ายไป storage tier แยกสำหรับเก็บหลักฐานตามระยะเวลาที่กฎหมายกำหนด ก่อนลบถาวรจริง
