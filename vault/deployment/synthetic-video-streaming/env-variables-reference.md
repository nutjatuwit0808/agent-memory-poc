---
layer: deployment
tags: [video-streaming, streamforge, environment, config, reference]
created: 2026-05-25
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[business-logic/synthetic-video-streaming/transcode-retry-policy]]"
  - "[[business-logic/synthetic-video-streaming/drm-license-issuance-policy]]"
  - "[[business-logic/synthetic-video-streaming/origin-shield-cache-policy]]"
  - "[[support-cases/synthetic-video-streaming/case-6823]]"
---

# Environment Variables Reference — StreamForge — แพลตฟอร์ม Transcode และ Streaming วิดีโอ

## transcode-worker-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `TRANSCODE_MAX_CONCURRENT_SEGMENTS` | `4` | ดู [[structure/synthetic-video-streaming/module-transcode-worker]] |
| `TRANSCODE_STALL_TIMEOUT_MS` | `120000` | ดู [[business-logic/synthetic-video-streaming/transcode-retry-policy]] |

## playlist-generator-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PLAYLIST_TARGET_DURATION_SEC` | `6` |  |
| `PLAYLIST_LIVE_WINDOW_SEGMENTS` | `15` | จำนวน segment สูงสุดใน live playlist window |

## drm-license-server-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `LICENSE_TTL_SEC` | `21600` | ดู [[business-logic/synthetic-video-streaming/drm-license-issuance-policy]] |
| `LICENSE_MAX_CONCURRENT_STREAMS` | `4` | ต่อ 1 account |
| `LICENSE_DB_URL` | `postgres://drm-db.internal:5432/drm` | secret ห้าม log |

## cdn-origin-shield-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ORIGIN_SHIELD_CACHE_TTL_SEC` | `86400` | ดู [[business-logic/synthetic-video-streaming/origin-shield-cache-policy]] |
| `ORIGIN_SHIELD_STAMPEDE_LOCK_MS` | `3000` | กัน cache stampede ดู [[support-cases/synthetic-video-streaming/case-6823]] |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
