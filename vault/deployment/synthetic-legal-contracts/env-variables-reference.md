---
layer: deployment
tags: [legal-contracts, lexdraft, environment, config, reference]
created: 2026-04-11
links:
  - "[[business-logic/synthetic-legal-contracts/approval-chain-by-value-policy]]"
  - "[[business-logic/synthetic-legal-contracts/renewal-notice-period-policy]]"
---

# Environment Variables Reference — LexDraft — ระบบบริหารวงจรชีวิตสัญญา

## template-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `TEMPLATE_VERSION_RETENTION_YEARS` | `10` |  |
| `MAX_CLAUSE_PER_TEMPLATE` | `80` |  |

## approval-router-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `APPROVAL_TIER_1_MAX_VALUE_THB` | `500000` | ดู [[business-logic/synthetic-legal-contracts/approval-chain-by-value-policy]] |
| `APPROVAL_TIER_2_MAX_VALUE_THB` | `5000000` |  |

## signature-orchestrator-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SIGNATURE_REQUEST_EXPIRY_DAYS` | `14` |  |
| `SIGNATURE_PROVIDER_API_KEY` | `sk_live_...` | secret ห้าม log |

## renewal-monitor-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `RENEWAL_NOTICE_DAYS_DEFAULT` | `90` | ดู [[business-logic/synthetic-legal-contracts/renewal-notice-period-policy]] |
| `RENEWAL_SCAN_CRON` | `0 6 * * *` |  |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
