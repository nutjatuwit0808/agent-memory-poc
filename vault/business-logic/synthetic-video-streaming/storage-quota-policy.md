---
layer: business-logic
tags: [storage, quota, policy]
created: 2025-12-09
links:
  - "[[business-logic/synthetic-video-streaming/storage-quota-policy-edge-cases]]"
---

# นโยบายโควตาพื้นที่จัดเก็บของ Publisher

แต่ละ publisher account มีโควตาพื้นที่จัดเก็บตาม plan ที่สมัคร ระบบตรวจสอบโควตาก่อนเริ่มรับอัปโหลดทุกครั้ง ถ้าพื้นที่เหลือไม่พอสำหรับไฟล์ต้นฉบับที่ประกาศขนาดมา จะปฏิเสธการอัปโหลดตั้งแต่ต้นไม่ให้เริ่ม

การนับพื้นที่ใช้งานรวมทั้งไฟล์ต้นฉบับและทุก rendition ที่ transcode ออกมา ไม่ใช่แค่ไฟล์ต้นฉบับอย่างเดียว เพราะ rendition หลายตัวรวมกันมักมีขนาดใหญ่กว่าต้นฉบับเสียอีก

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-video-streaming/storage-quota-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
