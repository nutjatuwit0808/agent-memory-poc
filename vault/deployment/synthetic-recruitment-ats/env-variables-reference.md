---
layer: deployment
tags: [recruitment-ats, talentflow, environment, config, reference]
created: 2026-07-04
links:
  - "[[business-logic/synthetic-recruitment-ats/requisition-approval-policy]]"
  - "[[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy]]"
  - "[[business-logic/synthetic-recruitment-ats/background-check-sla-policy]]"
---

# Environment Variables Reference — TalentFlow — ระบบติดตามผู้สมัครงาน (ATS)

## job-requisition-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `REQUISITION_MAX_APPROVAL_LEVELS` | `3` | ดู [[business-logic/synthetic-recruitment-ats/requisition-approval-policy]] |
| `REQUISITION_STALE_DAYS` | `45` |  |

## resume-parser-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PARSER_LOW_CONFIDENCE_THRESHOLD` | `0.6` | ต่ำกว่านี้ต้องให้คนตรวจซ้ำตาม [[business-logic/synthetic-recruitment-ats/auto-screen-decision-policy]] |
| `PARSER_TIMEOUT_MS` | `20000` |  |

## interview-scheduler-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SCHEDULER_CALENDAR_SYNC_INTERVAL_MS` | `300000` |  |
| `SCHEDULER_CALENDAR_API_TOKEN` | `***` | secret ห้าม log |

## background-check-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `BGCHECK_SLA_HOURS` | `72` | ดู [[business-logic/synthetic-recruitment-ats/background-check-sla-policy]] |
| `BGCHECK_WEBHOOK_SIGNING_SECRET` | `***` | secret ห้าม log |
| `BGCHECK_VENDOR_BASE_URL` | `https://vendor.example.internal` |  |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
