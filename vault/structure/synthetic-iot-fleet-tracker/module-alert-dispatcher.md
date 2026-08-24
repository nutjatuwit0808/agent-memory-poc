---
layer: structure
tags: [alerting, module]
created: 2025-11-02
links:
  - "[[structure/synthetic-iot-fleet-tracker/queue-architecture]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/alert-throttling-policy]]"
---

# Module: alert-dispatcher

ตัดสินใจว่า event ไหน (geofence, offline, ความเร็วเกิน) ควรแจ้งเตือนลูกค้าทันทีผ่าน push notification หรือ WebSocket และ event ไหนแค่บันทึกไว้ดูย้อนหลัง แยกออกมาเพราะกฎการแจ้งเตือนแตกต่างกันมากตามลูกค้าแต่ละราย (บางรายอยากรู้ทุกอย่าง บางรายอยากรู้เฉพาะเหตุการณ์วิกฤต)

## ฟังก์ชันหลัก
- `evaluateAlertRule(customerId: string, event: FleetEvent): Promise<AlertDecision>` — ตัดสินตามกฎที่ลูกค้าตั้งไว้ว่า event นี้ควรแจ้งเตือนหรือไม่
- `dispatchAlert(customerId: string, alert: AlertPayload): Promise<void>` — ส่งแจ้งเตือนจริงผ่าน channel ที่ลูกค้าเลือก (push/SMS/WebSocket)
- `suppressAlert(alertRuleId: string, until: string): Promise<void>` — ปิดการแจ้งเตือนชั่วคราวสำหรับกฎที่ระบุ เช่น ระหว่าง maintenance window

## ความสัมพันธ์กับ module อื่น

subscribe event เกือบทุกประเภทจาก queue กลาง (ดู [[structure/synthetic-iot-fleet-tracker/queue-architecture]]) — เป็น subscriber ปลายทางเสมอ ไม่ publish event กลับเข้า queue หลักเพื่อไม่ให้เกิด event loop ดู [[business-logic/synthetic-iot-fleet-tracker/alert-throttling-policy]] สำหรับการกัน alert ถี่เกินไป
