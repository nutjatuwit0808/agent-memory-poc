---
layer: convention
tags: [git, workflow]
created: 2026-08-08
links:
  - "[[convention/synthetic-content-delivery/branch-naming]]"
---

# Commit Message Style

## รูปแบบ

`<type>(<scope>): <คำอธิบาย>` เช่น `fix(invalidation-dispatcher): กัน race condition ระหว่าง markStale และ job status update`

## Type ที่ใช้

`feat`, `fix`, `refactor`, `docs`, `chore`, `security` — `security` เป็น type พิเศษสำหรับแก้ช่องโหว่ที่ต้องผ่าน security review ก่อน merge เสมอ ตรงกับ prefix ของ [[convention/synthetic-content-delivery/branch-naming]]
