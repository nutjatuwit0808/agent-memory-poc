---
layer: deployment
tags: [credential, security, runbook]
created: 2025-09-01
---

# Channel Credential Rotation Runbook

## ขั้นตอน

1) generate API key ใหม่จาก channel portal 2) อัปเดตใน SegmentIQ credential store ผ่าน admin API (ไม่ใช่ตรงๆ ใน config file) 3) trigger test export เพื่อยืนยัน credential ใหม่ใช้งานได้ 4) revoke key เก่าใน channel portal

## กรณีฉุกเฉิน

ถ้า credential expired และต้อง rotate ทันทีระหว่าง export cycle กำลังรัน ให้หยุด export ก่อน rotate แล้ว restart export หลัง verify — ห้าม rotate ระหว่างที่ export กำลัง in-flight เพราะจะทำให้ partial export
