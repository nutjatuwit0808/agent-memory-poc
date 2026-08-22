---
layer: deployment
tags: [ci-cd, pipeline]
created: 2026-02-05
links:
  - "[[convention/testing-convention]]"
  - "[[deployment/rollback-procedure]]"
---

# CI/CD Pipeline

## ขั้นตอนตอน push ขึ้น branch ใดๆ

1. `lint` — ESLint + typecheck
2. `test` — unit test ทั้งหมด ตาม [[convention/testing-convention]]
3. `build` — build image ของทุก service ที่มีไฟล์เปลี่ยน (ไม่ build ตัวที่ไม่แตะ)

## ขั้นตอนตอน merge เข้า `main`

4. `integration-test` — รันกับ staging environment จริง
5. `deploy-staging` — deploy อัตโนมัติ
6. `deploy-production` — ต้องกดอนุมัติด้วยมือ (manual approval gate)

## กติกา

- ห้าม skip step `test` แม้จะรีบแค่ไหน — ใช้ `--no-verify` ไม่ได้เพราะ pipeline บังคับที่ server ไม่ใช่ local hook
- production deploy ทำได้เฉพาะช่วงเวลา 09:00–17:00 วันจันทร์-พฤหัส เท่านั้น เว้น hotfix ที่ผ่านการอนุมัติ incident
- ถ้า deploy แล้วพบปัญหา ดูขั้นตอน rollback ที่ [[deployment/rollback-procedure]]
