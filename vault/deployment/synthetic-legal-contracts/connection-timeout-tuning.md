---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-06-09
---

# Connection Timeout Tuning

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| API gateway → approval-router | 3s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| template-engine → database pool acquire | 3s | `pg-pool` config |
| signature-orchestrator → e-signature provider | 15s | env `SIGNATURE_PROVIDER_TIMEOUT_MS` |

## เหตุผลที่ signature provider timeout นานกว่าปกติ

e-signature provider ภายนอกบางครั้งใช้เวลานานกว่าปกติเมื่อคู่สัญญากำลังกรอกข้อมูลยืนยันตัวตนเพิ่มเติม — timeout สั้นเกินไปจะทำให้ signature request ถูกยกเลิกกลางคันโดยไม่จำเป็น
