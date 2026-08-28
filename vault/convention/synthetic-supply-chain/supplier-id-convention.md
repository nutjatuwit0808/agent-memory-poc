---
layer: convention
tags: [supplier, naming, convention]
created: 2026-07-31
---

# Supplier & PO ID Convention

การกำหนด identifier ที่สอดคล้องกันทั่วทั้งระบบทำให้ log analysis และ audit trail ใช้งานได้จริง — เอกสารนี้กำหนดรูปแบบที่ต้องใช้ตรงกันทุก service

## Supplier ID

`S-<3 หลัก>` เช่น `S-001`, `S-023`, `S-077` — ต้องอ้างอิง supplier master record ในระบบเสมอ ไม่ใช้ชื่อซัพพลายเออร์ดิบๆ ใน log เพราะชื่ออาจเปลี่ยนได้

## PO ID

`PO-YYMM-<sequential 3 หลัก>` เช่น `PO-2405-118` — format ช่วยให้กรองโดย year-month ได้ทันทีจาก ID โดยไม่ต้อง query database ก่อน

## Shipment ID

`SHP-YYMM-<sequential>` โดย shipment-tracker เป็นผู้ออก ID นี้เสมอ ไม่ใช้หมายเลขของ carrier โดยตรงเพราะ format ต่างกันแต่ละราย — carrier tracking number เก็บเป็น separate field
