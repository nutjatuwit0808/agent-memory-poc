---
layer: convention
tags: [review, quality]
created: 2026-02-07
links:
  - "[[support-cases/synthetic-recruitment-ats/case-3611]]"
---

# Code Review Checklist

## สิ่งที่ต้องเช็คทุกครั้ง

ฟังก์ชันที่แก้ pipeline stage หรือ approval chain ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก [[support-cases/synthetic-recruitment-ats/case-3611]]) และ logic เทียบข้อมูลส่วนบุคคล (อีเมล, ชื่อ) ต้อง normalize ก่อนเทียบเสมอ ไม่เทียบ raw string ตรงๆ
