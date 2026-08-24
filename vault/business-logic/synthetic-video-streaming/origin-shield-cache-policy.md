---
layer: business-logic
tags: [cdn, cache, policy]
created: 2026-06-02
links:
  - "[[structure/synthetic-video-streaming/module-cdn-origin-shield]]"
  - "[[business-logic/synthetic-video-streaming/origin-shield-cache-policy-edge-cases]]"
---

# นโยบาย Cache ของ Origin Shield

[[structure/synthetic-video-streaming/module-cdn-origin-shield]] cache segment และ manifest ตาม `ORIGIN_SHIELD_CACHE_TTL_SEC` โดย cache key ต้องรวมสถานะการเข้ารหัส DRM ด้วยเสมอ ไม่ใช่แค่ path เพราะ segment เดียวกันอาจถูกขอทั้งแบบเข้ารหัสและไม่เข้ารหัสสำหรับผู้เล่นคนละประเภท

manifest ของ live event มี TTL สั้นกว่า segment มาก (ไม่เกิน target duration ของ playlist) เพราะ manifest ต้องอัปเดตทุกครั้งที่มี segment ใหม่ ในขณะที่ segment เองเปลี่ยนแปลงไม่ได้แล้วหลัง publish จึง cache ได้ยาว

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-video-streaming/origin-shield-cache-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
