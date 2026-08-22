---
layer: structure
tags: [auth, security, module]
created: 2026-01-11
links:
  - "[[structure/overview-architecture]]"
  - "[[deployment/env-variables-reference]]"
---

# Module: auth-service

ดูแล authentication (ยืนยันตัวตน) และ authorization (สิทธิ์การเข้าถึง) ของทั้งระบบ

## ฟังก์ชันหลัก

- `login(email, password)` — คืน JWT access token + refresh token
- `verifyToken(token)` — ใช้โดย API gateway ทุก request เพื่อเช็คว่า token ยังไม่หมดอายุ
- `refreshToken(refreshToken)` — ออก access token ใหม่โดยไม่ต้อง login ซ้ำ

## Token lifetime

- access token อายุ 15 นาที
- refresh token อายุ 30 วัน เก็บใน httpOnly cookie เท่านั้น ห้าม frontend อ่านค่าตรงๆ

## Error ที่พบบ่อย

`AUTH_TOKEN_EXPIRED` เกิดเมื่อ access token หมดอายุ — frontend ต้อง handle โดยเรียก `refreshToken` อัตโนมัติ ไม่ใช่ error ที่ควรโชว์ user เห็น

## Environment variable

`JWT_SECRET`, `JWT_ACCESS_TTL_SECONDS` — ดูค่า default ที่ [[deployment/env-variables-reference]]
