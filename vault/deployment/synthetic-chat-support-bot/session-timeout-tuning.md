---
layer: deployment
tags: [timeout, infrastructure]
created: 2026-05-06
links:
  - "[[business-logic/synthetic-chat-support-bot/conversation-state-ttl-policy]]"
---

# Session & Connection Timeout Tuning

เอกสารนี้พูดถึง timeout ระดับ infrastructure (WebSocket/connection) เท่านั้น ไม่ใช่ business timeout ของบทสนทนา — ดูเรื่องนั้นที่ [[business-logic/synthetic-chat-support-bot/conversation-state-ttl-policy]] แทน

## ค่าปัจจุบัน

| Layer | ค่า | ตั้งที่ไหน |
|---|---|---|
| WebSocket idle timeout | 90s | env `SESSION_IDLE_TIMEOUT_MS` |
| API gateway → intent-classifier | 3s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |
| intent-classifier inference | 800ms | env `CLASSIFY_TIMEOUT_MS` |
| knowledge-base-retriever query | 2s | env `KB_QUERY_TIMEOUT_MS` |

## เหตุการณ์ที่เจอจริง

เดือนเมษายน 2026 พบว่า WebSocket idle timeout สั้นเกินไปสำหรับลูกค้าที่พิมพ์ข้อความช้า (พิมพ์แล้วหยุดคิดนาน) ทำให้ session หลุดกลางบทสนทนาบ่อย ขยับจาก 45s เป็น 90s แก้ปัญหาได้
