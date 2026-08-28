---
layer: deployment
tags: [fraud-detection, shieldai, environment, config, reference]
created: 2025-11-20
links:
  - "[[business-logic/synthetic-fraud-detection/signal-retention-policy]]"
  - "[[business-logic/synthetic-fraud-detection/score-threshold-policy]]"
  - "[[business-logic/synthetic-fraud-detection/velocity-window-config-policy]]"
---

# Environment Variables Reference — ShieldAI — ระบบตรวจจับการทุจริต

## signal-collector-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SIGNAL_SCHEMA_VERSION` | `3.2` | version ที่รองรับ reject version เก่ากว่านี้ |
| `GEO_LOOKUP_TIMEOUT_MS` | `500` | เกินนี้ใช้ geo ว่างเปล่าแทน ไม่บล็อก signal |
| `SIGNAL_RETENTION_DAYS` | `90` | ดู [[business-logic/synthetic-fraud-detection/signal-retention-policy]] |

## rule-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `RULE_EVALUATION_TIMEOUT_MS` | `80` | เกินนี้คืน partial result ที่ evaluate ได้แทน timeout error |
| `RULE_ENGINE_DB_URL` | `postgres://rule-db.internal:5432/rules` | secret ห้าม log |
| `RULE_MAX_PER_EVALUATION` | `200` | cap จำนวน rule ที่ evaluate ต่อ signal เพื่อกัน runaway |

## ml-scorer-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ML_SCORING_TIMEOUT_MS` | `120` | เกินนี้คืน score จาก fallback model |
| `ML_HIGH_RISK_THRESHOLD` | `75` | ดู [[business-logic/synthetic-fraud-detection/score-threshold-policy]] |
| `ML_MODEL_ARTIFACT_PATH` | `s3://shieldai-models/prod/v12.3.bin` | path ของ model artifact ปัจจุบัน |

## velocity-tracker-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `VELOCITY_REDIS_URL` | `redis://velocity-cache.internal:6379` | secret ห้าม log |
| `VELOCITY_DEFAULT_WINDOW_SEC` | `300` | ดู [[business-logic/synthetic-fraud-detection/velocity-window-config-policy]] |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
