---
layer: deployment
tags: [hr-onboarding, onboardflow, environment, config, reference]
created: 2026-06-16
links:
  - "[[business-logic/synthetic-hr-onboarding/day-one-access-policy]]"
  - "[[business-logic/synthetic-hr-onboarding/document-signature-policy]]"
  - "[[deployment/synthetic-hr-onboarding/provisioning-timeout-tuning]]"
---

# Environment Variables Reference — OnboardFlow — ระบบจัดการ Onboarding พนักงานใหม่

## onboarding-workflow-engine-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ONBOARDING_STAGE_TIMEOUT_HOURS` | `48` | ดู [[business-logic/synthetic-hr-onboarding/day-one-access-policy]] |
| `ONBOARDING_MAX_STAGE_RETRY` | `2` |  |
| `ONBOARDING_DB_URL` | `postgres://onboarding-db.internal:5432/onboarding` | secret ห้าม log |

## document-collection-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `ESIGN_WEBHOOK_SECRET` | `whsec_xxx` | secret ใช้ validate webhook signature |
| `DOC_SIGNATURE_STUCK_THRESHOLD_HOURS` | `24` | ดู [[business-logic/synthetic-hr-onboarding/document-signature-policy]] |

## access-provisioning-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `PROVISION_QUEUE_MAX_DEPTH` | `200` |  |
| `IT_TICKETING_API_KEY` | `itk_live_xxx` | secret |
| `BADGE_SYSTEM_TIMEOUT_MS` | `8000` | ดู [[deployment/synthetic-hr-onboarding/provisioning-timeout-tuning]] |

## compliance-tracker-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `COMPLIANCE_DEFAULT_DEADLINE_DAYS` | `30` |  |
| `COMPLIANCE_REMINDER_LEAD_DAYS` | `7` | ส่ง reminder ล่วงหน้ากี่วันก่อนถึง deadline |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
