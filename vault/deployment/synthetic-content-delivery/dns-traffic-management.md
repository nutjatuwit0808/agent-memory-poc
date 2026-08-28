---
layer: deployment
tags: [dns, anycast, traffic]
created: 2026-06-12
---

# DNS & Traffic Management

EdgeServe ใช้ anycast routing เพื่อให้ DNS ระดับบนสุด resolve ไปยัง IP ที่ route ไปยัง PoP ที่ใกล้ที่สุดโดยอัตโนมัติ เอกสารนี้อธิบาย architecture และขั้นตอนจัดการ DNS ในสถานการณ์ต่างๆ

## Anycast IP management

Anycast IP pool ถูกจัดการโดย network team แยกจาก software service — เมื่อ PoP ใหม่เพิ่มเข้ามา network team ต้องประกาศ BGP route ก่อน จึงจะมี traffic จริงเข้ามา การ provision ซอฟต์แวร์และ BGP announcement ต้องเกิดขึ้นในลำดับที่ถูกต้องเสมอ

## DNS TTL สำหรับ tenant custom domain

Tenant ที่ใช้ custom domain (CNAME ไปยัง EdgeServe) ต้องตั้ง DNS TTL ของ CNAME ไม่ต่ำกว่า 5 นาที เพื่อป้องกัน DNS lookup storm เมื่อ traffic สูง — แนะนำให้ใช้ 5 นาทีถึง 1 ชั่วโมงตามความถี่ที่ tenant ต้องการ migrate origin
