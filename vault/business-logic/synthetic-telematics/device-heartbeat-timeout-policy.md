---
layer: business-logic
tags: [device, policy]
created: 2026-07-17
links:
  - "[[business-logic/synthetic-telematics/device-heartbeat-timeout-policy-edge-cases]]"
---

# นโยบายเวลาหมดอายุ Heartbeat อุปกรณ์

อุปกรณ์ที่ไม่ส่ง heartbeat ภายใน `DEVICE_HEARTBEAT_TIMEOUT_MIN` นาทีจะถูกเปลี่ยนสถานะเป็น inactive และแจ้งเตือนทีมสนับสนุนให้ติดต่อผู้ขับตรวจสอบ ไม่ปล่อยให้อุปกรณ์ดูเหมือน active ทั้งที่ขาดการเชื่อมต่อไปแล้ว

ช่วงเวลาที่อุปกรณ์ inactive จะไม่ถูกนับเป็นช่วงที่ผู้ขับ 'ไม่ขับรถเลย' สำหรับการคำนวณคะแนน แต่ถูก flag แยกเป็น 'ไม่มีข้อมูล' เพื่อไม่ให้กระทบคะแนนในทางที่ไม่เป็นธรรมต่อผู้ขับ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-telematics/device-heartbeat-timeout-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
