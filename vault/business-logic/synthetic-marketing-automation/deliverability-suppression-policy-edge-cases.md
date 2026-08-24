---
layer: business-logic
tags: [deliverability, edge-case]
created: 2025-11-19
links:
  - "[[business-logic/synthetic-marketing-automation/deliverability-suppression-policy]]"
---

# ข้อยกเว้นเมื่อ Bounce เกิดจาก ESP ฝั่งเดียว ไม่ใช่ทั้งแคมเปญ

ถ้า bounce rate สูงกระจุกอยู่ที่ ESP ปลายทางเดียว (เช่น domain เดียวที่มีปัญหา) และ ESP อื่นยังปกติ ระบบจะ pause เฉพาะการส่งไปยัง ESP นั้น ไม่ pause ทั้ง send job — แบ่งการ suppress ตามระดับ domain แทนระดับ job ทั้งหมด

การตัดสินว่าเป็นปัญหาระดับ ESP เดียวหรือทั้งแคมเปญ ใช้เกณฑ์ว่า bounce กระจุกเกิน 80% อยู่ที่ domain เดียวหรือไม่ ถ้ากระจายหลาย domain พร้อมกันถือว่าเป็นปัญหาระดับแคมเปญและ pause ทั้งหมดตามเกณฑ์ปกติ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-marketing-automation/deliverability-suppression-policy]] ("นโยบายการ Suppress อัตโนมัติเมื่อ Deliverability ตก") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
