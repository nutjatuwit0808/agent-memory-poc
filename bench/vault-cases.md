# Vault test cases — บันทึกว่าไฟล์ไหนคือเคสไหน

อ้างอิงตาม [plans/00-foundation.md](../plans/00-foundation.md) P0-5 — 5 เคสที่ต้องมีในวอลต์เพื่อทำให้ search backend ต่างกันในภายหลัง

## 1. คำเดียวกันคนละความหมายข้าม layer ("timeout")

- [vault/deployment/connection-timeout-tuning.md](../vault/deployment/connection-timeout-tuning.md) — timeout ระดับ infrastructure/connection (nginx, gateway, DB pool)
- [vault/business-logic/refund-timeout-policy.md](../vault/business-logic/refund-timeout-policy.md) — timeout ระดับ business (คำขอคืนเงินค้างนานแค่ไหนถึงนับว่า stuck)

ใช้ทดสอบ layer pre-filter ใน Workshop 04 — keyword search ธรรมดาจะคืนทั้งสองไฟล์ปนกันโดยแยกไม่ออกว่า query ต้องการความหมายไหน

## 2. เรื่องเดียวกันเขียนคนละคำ (คืนเงิน / refund / ยกเลิกรายการ)

- [vault/business-logic/refund-policy.md](../vault/business-logic/refund-policy.md) — "คืนเงิน" / "refund"
- [vault/business-logic/order-cancellation-policy.md](../vault/business-logic/order-cancellation-policy.md) — "ยกเลิกรายการ" พร้อมอธิบายว่าต่างจาก "คืนเงิน" อย่างไร
- [vault/support-cases/case-2891.md](../vault/support-cases/case-2891.md), [vault/support-cases/case-3012.md](../vault/support-cases/case-3012.md) — ใช้คำแบบลูกค้าจริงปนกัน

ใช้ทดสอบ semantic search ใน Workshop 03 — keyword-based (ripgrep/FTS5) จะพลาด note ที่เกี่ยวข้องแต่ใช้คำไม่ตรงกัน

## 3. Note ยาว >2000 คำ (นับด้วย Thai-aware word count ใน `vaultStats()`)

- [vault/business-logic/long-form-payment-lifecycle.md](../vault/business-logic/long-form-payment-lifecycle.md) — 2180 คำ
- [vault/business-logic/long-form-order-state-machine.md](../vault/business-logic/long-form-order-state-machine.md) — 2077 คำ
- [vault/deployment/incident-response-runbook.md](../vault/deployment/incident-response-runbook.md) — 2039 คำ

ใช้ทดสอบ whole-note vs chunked embedding ใน Workshop 03

## 4. ชื่อ identifier ตรงตัว (function name, env var)

- [vault/structure/module-payment-identifiers.md](../vault/structure/module-payment-identifiers.md) — `chargePayment`, `verifyPayment`, `retryPayment`, `reversePayment`, `MAX_RETRY_ATTEMPTS`
- [vault/deployment/env-variables-reference.md](../vault/deployment/env-variables-reference.md) — `PAYMENT_GATEWAY_API_KEY`, `REFUND_SERVICE_URL`, `JWT_SECRET` ฯลฯ

ใช้แสดงจุดที่ keyword search ชนะ semantic search — query ที่ grep ชื่อ identifier ตรงตัวจะแม่นกว่า embedding ที่มองความหมายรวม

## 5. Wikilink เชื่อมข้าม layer

พบได้เกือบทุกไฟล์ในวอลต์ (ยืนยันด้วย `readVault` — broken wikilinks: 0) ตัวอย่างเส้นทางที่ข้าม layer ชัดเจน:

- `structure/module-refund.md` → `business-logic/refund-policy.md` → `convention/error-code-convention.md`
- `deployment/incident-response-runbook.md` → `business-logic/refund-timeout-policy.md`, `structure/module-payment.md`, `deployment/rollback-procedure.md`
- `business-logic/long-form-payment-lifecycle.md` → `structure/module-payment.md`, `business-logic/payment-retry-policy.md`, `convention/logging-convention.md`

ใช้ตอนวิเคราะห์ผล (เช่น ตรวจว่า backend ไหนใช้ประโยชน์จาก link graph ได้หรือไม่)
