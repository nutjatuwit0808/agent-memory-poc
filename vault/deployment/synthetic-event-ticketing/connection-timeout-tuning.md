---
layer: deployment
tags: [timeout, infrastructure]
created: 2025-12-14
---

# Connection Timeout Tuning

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| API gateway → seat-inventory | 1.5s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| entry-scanner → database pool acquire | 500ms | `pg-pool` config |
| resale-marketplace → transfer-processor | 3s | env `TRANSFER_CALL_TIMEOUT_MS` |

## เหตุผลที่ entry-scanner timeout สั้นมาก

การสแกนบัตรหน้างานต้องเร็วที่สุดเพื่อไม่ให้แถวเข้างานยาว timeout 500ms ทำให้เครื่องสแกนสลับไปใช้ cache offline เร็วขึ้นถ้า network ช้าผิดปกติ
