---
layer: deployment
tags: [migration, runbook]
created: 2025-10-26
links:
  - "[[structure/synthetic-ad-bidding/module-budget-pacer]]"
  - "[[structure/synthetic-ad-bidding/module-win-notice-processor]]"
  - "[[support-cases/synthetic-ad-bidding/case-6423]]"
---

# Campaign Schema Migration Runbook

## เมื่อไหร่ต้องทำ

เมื่อต้องเปลี่ยนโครงสร้างตารางแคมเปญ (เพิ่ม field, เปลี่ยนประเภท campaign_id, รวมฐานข้อมูลจาก acquisition) ต้อง migrate ข้อมูลใน [[structure/synthetic-ad-bidding/module-budget-pacer]] และ [[structure/synthetic-ad-bidding/module-win-notice-processor]] พร้อมกันเสมอเพราะทั้งคู่อ้างอิง campaign_id ร่วมกัน

## ขั้นตอน

1) หยุดรับ win notice ใหม่ชั่วคราว 2) export ข้อมูลเดิมสำรองไว้ 3) ตรวจสอบ sequence สูงสุดของ campaign_id เดิมก่อน generate id ใหม่เสมอ (บทเรียนจาก [[support-cases/synthetic-ad-bidding/case-6423]]) 4) import ข้อมูลใหม่แล้ว reconcile ยอด spend ให้ตรงก่อนเปิดรับ win notice อีกครั้ง
