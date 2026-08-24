---
layer: structure
tags: [cdn, module, caching]
created: 2025-11-03
links:
  - "[[structure/synthetic-video-streaming/module-drm-license-server]]"
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[business-logic/synthetic-video-streaming/origin-shield-cache-policy]]"
---

# Module: cdn-origin-shield

ทำหน้าที่เป็น layer กลางระหว่าง edge CDN กับ object storage/DRM ต้นทาง เพื่อลดจำนวน request ที่วิ่งไปถึงต้นทางจริงเมื่อวิดีโอเดียวกันถูกขอพร้อมกันจากหลาย edge node แยกออกมาเป็น service อิสระเพราะ cache strategy ของวิดีโอ (segment ขนาดใหญ่, TTL ยาว) ต่างจาก cache ทั่วไปมาก

## ฟังก์ชันหลัก
- `fetchFromOrigin(path: string): Promise<CachedResponse>` — ดึง segment/manifest จากต้นทางจริงเมื่อ cache miss พร้อม coalesce request ซ้ำ
- `primeCache(assetId: string, renditions: string[]): Promise<void>` — โหลด cache ล่วงหน้าสำหรับวิดีโอที่คาดว่าจะมีคนดูเยอะ เช่นก่อน live event เริ่ม
- `purgeCache(pattern: string): Promise<void>` — ล้าง cache ตาม pattern ของ path เมื่อคอนเทนต์เปลี่ยนหรือถูกถอด

## ความสัมพันธ์กับ module อื่น

เรียก [[structure/synthetic-video-streaming/module-drm-license-server]] แทน [[structure/synthetic-video-streaming/module-transcode-worker]] เมื่อ segment ที่ร้องขอต้องเข้ารหัส DRM — ตรรกะ cache key ต้องแยกตามสถานะการเข้ารหัสด้วย ไม่ใช่แค่ path เฉยๆ ดู [[business-logic/synthetic-video-streaming/origin-shield-cache-policy]]
