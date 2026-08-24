---
layer: convention
tags: [intent, naming, convention]
created: 2026-03-16
links:
  - "[[structure/synthetic-chat-support-bot/module-intent-classifier]]"
  - "[[structure/synthetic-chat-support-bot/module-handoff-router]]"
  - "[[convention/synthetic-chat-support-bot/testing-convention]]"
---

# Intent Label Naming Convention

เอกสารนี้กำหนดชื่อ label ที่ใช้ร่วมกันระหว่าง [[structure/synthetic-chat-support-bot/module-intent-classifier]] และ [[structure/synthetic-chat-support-bot/module-handoff-router]] เพื่อไม่ให้สองฝั่งตีความ label เดียวกันต่างกัน

## รูปแบบชื่อ

`snake_case` ตัวพิมพ์เล็กทั้งหมด เช่น `billing_inquiry`, `technical_issue`, `cancellation` ห้ามใช้ตัวย่อที่ไม่ชัดเจน

## กติกา

label ใหม่ที่ยังไม่ผ่านการฝึกโมเดลด้วยตัวอย่างเพียงพอ (อย่างน้อย 200 ตัวอย่างต่อ label) ห้ามเปิดใช้งานจริงจนกว่าจะผ่าน [[convention/synthetic-chat-support-bot/testing-convention]] ครบ
