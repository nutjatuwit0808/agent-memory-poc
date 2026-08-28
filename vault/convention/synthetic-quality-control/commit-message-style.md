---
layer: convention
tags: [git, workflow]
created: 2025-11-29
---

# Commit Message Style

## รูปแบบ

`<type>(<scope>): <คำอธิบาย>` เช่น `fix(batch-inspector): บล็อก self-approval ด้วย batch-scoped lock แทน time window`

## Type ที่ใช้

`feat`, `fix`, `refactor`, `docs`, `chore` — scope ควรตรงกับชื่อ module หรือ policy ที่แก้ เพื่อให้ git log กรองตาม component ได้
