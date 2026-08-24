---
layer: business-logic
tags: [alerting, edge-case]
created: 2026-03-13
links:
  - "[[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy]]"
  - "[[business-logic/synthetic-iot-fleet-tracker/alert-throttling-policy]]"
---

# ข้อยกเว้นสำหรับแจ้งเตือนโซน Restricted

แจ้งเตือนที่มาจากการเข้าโซน `restricted` (ดู [[business-logic/synthetic-iot-fleet-tracker/geofence-debounce-policy]]) ไม่ถูก throttle เลย ทุกครั้งที่ event เข้าโซนนี้เกิดขึ้นจริงจะส่งแจ้งเตือนเสมอ แม้จะเกิดถี่กว่า `ALERT_THROTTLE_WINDOW_SEC` เพราะแต่ละครั้งถือเป็นเหตุการณ์ที่ต้องมีคนรับทราบแยกกัน

ระหว่าง maintenance window ที่ประกาศล่วงหน้า ทีมสามารถ `suppressAlert` ปิดแจ้งเตือนบางกฎชั่วคราวได้ แม้จะเป็นกฎที่ปกติไม่ถูก throttle ก็ตาม เพื่อรองรับการทดสอบระบบโดยไม่ต้องรบกวนลูกค้า

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-iot-fleet-tracker/alert-throttling-policy]] ("นโยบาย Throttle การแจ้งเตือน") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
