---
layer: deployment
tags: [document-signing, signflow, environment, config, reference]
created: 2026-06-30
links:
  - "[[business-logic/synthetic-document-signing/envelope-expiration-policy]]"
  - "[[business-logic/synthetic-document-signing/audit-trail-integrity-policy]]"
---

# Environment Variables Reference — SignFlow — แพลตฟอร์มเซ็นเอกสารอิเล็กทรอนิกส์

## envelope-builder-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `MAX_SIGNERS_PER_ENVELOPE` | `20` |  |
| `DEFAULT_EXPIRATION_DAYS` | `14` | ดู [[business-logic/synthetic-document-signing/envelope-expiration-policy]] |

## signature-capture-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `SIGNATURE_IMAGE_MAX_KB` | `200` |  |
| `SIGN_CAPTURE_DB_URL` | `postgres://sign-db.internal:5432/signature` | secret ห้าม log |

## audit-trail-logger-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `HASH_ALGO` | `SHA-256` | ดู [[business-logic/synthetic-document-signing/audit-trail-integrity-policy]] |
| `AUDIT_LOG_DB_URL` | `postgres://audit-db.internal:5432/audit` | secret ห้าม log, ต้อง append-only permission เท่านั้น |

## notary-integration-service

| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |
|---|---|---|
| `NOTARY_WEBHOOK_SECRET` | `whsec_xxx` | secret ห้าม log ใช้ verify webhook signature |
| `NOTARY_SESSION_TIMEOUT_MS` | `600000` |  |

## กติกา

ตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น
