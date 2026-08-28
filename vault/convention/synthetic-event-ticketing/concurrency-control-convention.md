---
layer: convention
tags: [reliability, database]
created: 2025-10-10
links:
  - "[[support-cases/synthetic-event-ticketing/case-1330]]"
  - "[[support-cases/synthetic-event-ticketing/case-5087]]"
---

# Concurrency Control Convention

เอกสารนี้กำหนดวิธีจัดการ concurrent write ให้สอดคล้องกันทั้งระบบ เพราะเป็นปัญหาที่เกิดซ้ำหลายครั้งในหลาย module ของโดเมนนี้

## หลักการทั่วไป

ฟังก์ชันที่แก้ไขสถานะที่มีผลกระทบทางธุรกิจสำคัญ (ที่นั่ง, การสแกนเข้างาน) ต้องใช้ conditional update แบบ atomic เสมอ ไม่ใช่อ่านค่าปัจจุบันมาตรวจสอบแล้วเขียนแยกเป็นสองขั้นตอน

## บทเรียนจากเหตุการณ์จริง

ปัญหานี้เกิดซ้ำทั้งใน [[support-cases/synthetic-event-ticketing/case-1330]] และ [[support-cases/synthetic-event-ticketing/case-5087]] — เป็นสัญญาณว่าทีมต้องตรวจสอบ pattern นี้เชิงรุกในทุก module ใหม่ที่เขียนขึ้น ไม่ใช่รอให้เกิดปัญหาก่อนแล้วค่อยแก้ทีละจุด
