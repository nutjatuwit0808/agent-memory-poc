---
layer: business-logic
tags: [origin, retry, stale-fallback, edge-case]
created: 2026-05-14
links:
  - "[[business-logic/synthetic-content-delivery/origin-retry-policy]]"
---

# ข้อยกเว้นของนโยบาย Origin Retry: Stale Cache Fallback

ถ้า origin ล้มเหลวทุก retry แล้ว แต่ยังมี cache entry เดิมอยู่แม้จะ stale แล้ว EdgeServe จะเสิร์ฟเนื้อหา stale นั้นต่อพร้อม response header `X-EdgeServe-Stale: true` แทนที่จะ return 503 ให้ผู้ใช้ เพราะเนื้อหาเก่าดีกว่าไม่มีเนื้อหาเลยสำหรับ video และ media content ส่วนใหญ่

ข้อยกเว้นของข้อยกเว้น: content ที่ tenant ตั้ง `stale_fallback_allowed: false` ใน config จะไม่ใช้ stale cache ไม่ว่ากรณีใด เหมาะสำหรับ content ที่ถ้าเสิร์ฟข้อมูลเก่าแล้วผิดหลักกฎหมาย เช่น เนื้อหาที่มี licensing ที่หมดอายุแล้วต้องหยุดให้บริการทันที

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-content-delivery/origin-retry-policy]] ("นโยบาย Retry เมื่อ Origin Server ตอบ 5xx") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
