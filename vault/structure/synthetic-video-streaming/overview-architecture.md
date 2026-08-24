---
layer: structure
tags: [video-streaming, streamforge, architecture, overview]
created: 2025-11-21
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[structure/synthetic-video-streaming/module-playlist-generator]]"
  - "[[structure/synthetic-video-streaming/module-cdn-origin-shield]]"
  - "[[structure/synthetic-video-streaming/module-drm-license-server]]"
  - "[[structure/synthetic-video-streaming/module-thumbnail-extractor]]"
  - "[[structure/synthetic-video-streaming/module-bitrate-ladder-selector]]"
---

# ภาพรวมสถาปัตยกรรม StreamForge — แพลตฟอร์ม Transcode และ Streaming วิดีโอ

StreamForge คือแพลตฟอร์มรับวิดีโอต้นฉบับจากผู้ผลิตคอนเทนต์ (สื่อ, คอร์สออนไลน์, ผู้จัดงาน live event) แล้ว transcode เป็นหลาย rendition ตามความละเอียด/bitrate ที่ต่างกัน สร้าง adaptive bitrate playlist แบบ HLS/DASH และส่งออกผ่าน CDN พร้อมระบบ DRM สำหรับคอนเทนต์ที่ต้องป้องกันการคัดลอก ระบบแยกเส้นทาง VOD (วิดีโอที่อัปโหลดไว้ล่วงหน้า) กับ live event (สตรีมสด) ออกจากกันตั้งแต่ระดับ ingest เพราะข้อจำกัดด้าน latency ต่างกันมาก

ทีมวิศวกรรมแยก service ตามภาระงาน — งาน transcode กิน CPU/GPU หนักและ scale ตามคิวงาน ส่วนงาน serve การเล่นวิดีโอต้องการ latency ต่ำและ scale ตามจำนวนผู้ชม สองอย่างนี้มี failure mode คนละแบบจึงแยก service เด็ดขาด ช่วงเวลาที่ทีมเรียกว่า primetime window (19:00-22:00) คือช่วงที่ทั้งการอัปโหลด VOD ใหม่และ live event ชนกันหนาแน่นที่สุด และเป็นช่วงที่ incident ส่วนใหญ่เกิด

## Module หลัก

- **transcode-worker** — รับผิดชอบแปลงไฟล์วิดีโอต้นฉบับ (หรือ segment สดจาก live ingest) เป็นหลาย renditi ดู [[structure/synthetic-video-streaming/module-transcode-worker]]
- **playlist-generator** — สร้างและอัปเดต adaptive bitrate manifest (HLS master/media playlist หรือ DASH MP ดู [[structure/synthetic-video-streaming/module-playlist-generator]]
- **cdn-origin-shield** — ทำหน้าที่เป็น layer กลางระหว่าง edge CDN กับ object storage/DRM ต้นทาง เพื่อลดจำ ดู [[structure/synthetic-video-streaming/module-cdn-origin-shield]]
- **drm-license-server** — ออก license ให้ผู้เล่นวิดีโอที่ผ่านการยืนยันตัวตนแล้วสามารถถอดรหัสคอนเทนต์ที่ป้อ ดู [[structure/synthetic-video-streaming/module-drm-license-server]]
- **thumbnail-extractor** — ดึงภาพนิ่งจากวิดีโอเพื่อทำ poster image และ sprite sheet สำหรับแถบ scrub บนผู้เล ดู [[structure/synthetic-video-streaming/module-thumbnail-extractor]]
- **bitrate-ladder-selector** — คำนวณว่าวิดีโอต้นฉบับหนึ่งไฟล์ควร transcode เป็นกี่ rendition และแต่ละ rendition ดู [[structure/synthetic-video-streaming/module-bitrate-ladder-selector]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-video-streaming/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-video-streaming/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-video-streaming/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-video-streaming/database-schema]]
