---
layer: deployment
tags: [assessment, configuration]
created: 2025-09-07
links:
  - "[[structure/synthetic-e-learning/module-assessment-engine]]"
---

# Assessment Engine Configuration Guide

เอกสารอธิบาย configuration สำคัญของ [[structure/synthetic-e-learning/module-assessment-engine]] ที่กระทบ learner experience และ security — ต้องอ่านก่อนปรับ config ทุกครั้ง

## Timer configuration

`DEFAULT_QUIZ_TIMER_MIN` คือค่า default สำหรับ quiz ที่ไม่ได้กำหนด timer ใน assessment config quiz สำคัญควร override timer ใน assessment config แทนการเปลี่ยน default เพราะ default กระทบทุก quiz ที่ไม่มีการ specify

## Retake cooldown

`RETAKE_COOLDOWN_HOURS` ควรตั้งอย่างน้อย 24 ชั่วโมงสำหรับ compliance assessment เพื่อให้ learner มีเวลา review เนื้อหาจริงๆ การตั้งต่ำเกินไปทำให้ระบบไม่มีความหมายในการป้องกัน brute force
