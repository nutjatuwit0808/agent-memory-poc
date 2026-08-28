---
layer: deployment
tags: [device, runbook]
created: 2026-06-09
links:
  - "[[support-cases/synthetic-telematics/case-3238]]"
---

# Device Firmware Rollout Runbook

ขั้นตอนการทยอยอัปเดต firmware ของอุปกรณ์ OBD-II ในสนามจริง ต้องระมัดระวังเพราะแก้ไขอุปกรณ์ที่ติดตั้งอยู่ในรถผู้ขับจริงหลายพันคัน

## การทยอย rollout

อัปเดต firmware เป็นกลุ่มย่อย 5% ของอุปกรณ์ทั้งหมดก่อนเสมอ ตรวจสอบอัตราการเชื่อมต่อสำเร็จและคุณภาพข้อมูลก่อนขยายไปกลุ่มถัดไป ไม่ rollout พร้อมกันทั้งหมดในครั้งเดียว

## บทเรียนจากเหตุการณ์จริง

ดู [[support-cases/synthetic-telematics/case-3238]] — firmware บางรุ่นมีพฤติกรรม retry ที่ไม่คาดคิด ต้องทดสอบกับอุปกรณ์รุ่นเดียวกันจริงก่อน rollout วงกว้างเสมอ
