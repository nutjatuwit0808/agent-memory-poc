---
layer: business-logic
tags: [transcode, priority, policy]
created: 2025-09-12
links:
  - "[[structure/synthetic-video-streaming/module-transcode-worker]]"
  - "[[business-logic/synthetic-video-streaming/transcode-priority-policy-edge-cases]]"
---

# นโยบายลำดับความสำคัญของคิว Transcode

job transcode ของ live event มี priority สูงกว่า VOD backlog เสมอ — [[structure/synthetic-video-streaming/module-transcode-worker]] จะดึง job จากคิว live ก่อนคิว VOD ทุกครั้งที่มี worker ว่าง เพราะ live event ล่าช้าแม้ไม่กี่วินาทีกระทบผู้ชมทันที ในขณะที่ VOD backlog ล่าช้าไม่กี่นาทีแทบไม่มีใครสังเกต

ภายในคิว live เอง job จะเรียงตามเวลาที่ event เริ่มจริง ไม่ใช่เวลาที่ job เข้าคิว เพื่อให้ event ที่กำลังจะเริ่มได้ worker ก่อน event ที่ยังอยู่ในช่วงเตรียมการ

## ทำไมไม่ preempt job ที่กำลังทำอยู่

ถ้า live job priority สูงกว่ามาถึงระหว่างที่ worker กำลัง transcode VOD job อยู่ ระบบจะไม่ preempt VOD job กลางคัน — ปล่อยให้ทำ segment ปัจจุบันจบก่อนแล้วค่อยสลับ เพราะการ preempt กลาง segment ทำให้ต้อง transcode segment นั้นใหม่ทั้งหมด เสียเวลามากกว่ารอให้จบสั้นๆ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-video-streaming/transcode-priority-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
