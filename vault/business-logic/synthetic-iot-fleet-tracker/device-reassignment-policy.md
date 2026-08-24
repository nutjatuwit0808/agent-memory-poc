---
layer: business-logic
tags: [provisioning, policy]
created: 2025-09-04
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/device-reassignment-policy-edge-cases]]"
---

# นโยบายการย้ายอุปกรณ์ข้ามยานพาหนะ

อุปกรณ์สามารถย้ายจากรถคันหนึ่งไปติดอีกคันได้ผ่าน `reassignDevice` แต่ต้องปิดทริปที่กำลัง in_progress ของรถคันเดิมก่อนเสมอ ไม่งั้นข้อมูลทริปจะปนกันระหว่างสองคัน

ประวัติ ping และทริปเก่าที่ผูกกับ deviceId ยังคงอยู่ ไม่ถูกย้ายตามไปที่รถคันใหม่ — รายงานย้อนหลังจึงต้อง join กับตาราง `device_activation_log` เพื่อดูว่าช่วงเวลาไหนอุปกรณ์ตัวนี้ผูกกับรถคันไหน

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-iot-fleet-tracker/device-reassignment-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
