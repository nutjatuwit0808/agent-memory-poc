---
layer: convention
tags: [content, moderation]
created: 2026-03-04
links:
  - "[[structure/synthetic-social-feed/module-feed-ranker]]"
---

# Content Tagging Convention

โพสต์ทุกตัวต้องมี tag อัตโนมัติจากระบบ classification เพื่อใช้ทั้งในการจัดอันดับและการตรวจสอบเนื้อหา — เอกสารนี้กำหนดรูปแบบ tag ที่ต้องใช้ตรงกันทุก service

## หมวดหมู่หลัก

`topic:<หัวข้อ>`, `sensitivity:<low|medium|high>`, `lang:<รหัสภาษา ISO 639-1>` ต้องมีครบทั้ง 3 หมวดในทุกโพสต์ ขาดตัวใดตัวหนึ่ง [[structure/synthetic-social-feed/module-feed-ranker]] จะปฏิเสธนำไปจัดอันดับ

## การอัปเดต tag

tag ที่ได้จาก classification อัตโนมัติปรับแก้ด้วยมือได้เฉพาะทีม trust & safety เท่านั้น ผู้ใช้ทั่วไปแก้ tag ของโพสต์ตัวเองไม่ได้เพื่อป้องกันการหลบเลี่ยงการตรวจสอบ
